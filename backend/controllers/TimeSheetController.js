const prisma = require("../prismaClient");

const IST_OFFSET_MINUTES = 330; // +05:30 for IST

// --- Helper Functions ---

function getISTMidnightUTC(date) {
  // Accepts 'YYYY-MM-DD' string or Date object
  const d =
    typeof date === "string"
      ? new Date(date + "T00:00:00+05:30")
      : new Date(date);
  return new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      18,
      30,
      0,
      0 // IST midnight = 18:30 UTC previous day
    )
  );
}

function parseISTTimeOnDate(dateStr, timeStr) {
  // Given 'YYYY-MM-DD' and 'HH:mm' string, returns UTC Date corresponding to IST datetime
  const [hour, minute] = timeStr.split(":").map(Number);
  const isoStr = `${dateStr}T${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}:00+05:30`;
  return new Date(isoStr);
}

function toISTDateString(date) {
  // Converts UTC Date object to IST date string 'YYYY-MM-DD'
  const ist = new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

function daysBetween(date1, date2) {
  // Returns difference in whole days between two dates normalized to IST midnight UTC
  const msPerDay = 1000 * 60 * 60 * 24;
  const d1 = getISTMidnightUTC(date1).getTime();
  const d2 = getISTMidnightUTC(date2).getTime();
  return Math.floor((d1 - d2) / msPerDay);
}

function getWeekStartIST(date) {
  const IST_OFFSET_MINUTES = 330; // Ensure scope or define if needed
  const d =
    typeof date === "string"
      ? new Date(date + "T00:00:00+05:30")
      : new Date(date);

  d.setMinutes(d.getMinutes() + IST_OFFSET_MINUTES); // Shift to IST

  // day 0=Sun, 1=Mon..., shift so that Monday is start
  const day = d.getDay();
  // Move back to Monday of current week (if Sunday, goes back 6 days)
  d.setDate(d.getDate() - ((day + 7) % 7) - 1);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(d.getMinutes() - IST_OFFSET_MINUTES); // Shift back to UTC

  console.log(d.getDate() - 1);

  console.log("1321432535",d.getDate());
  console.log(d.getDate() - ((day + 7) % 7) - 1);

  

  return d;
}

async function ensureWeeklyTimesheet(user_id, date) {
  // Return existing or create new WeeklyTimesheet for user_id and week of date
  const week_start = getWeekStartIST(date);
  let weekly = await prisma.weeklyTimesheet.findFirst({
    where: { user_id, week_start },
  });
  if (!weekly) {
    weekly = await prisma.weeklyTimesheet.create({
      data: { user_id, week_start },
    });
  }
  // Populate Holidays (Sat, Sun) automatically on week creation or load
  await populateHolidaysForWeek(user_id, week_start);
  return weekly;
}

function getISTDayBounds(date) {
  // Returns start and end of IST day range in UTC for filtering
  const d = new Date(date);
  const start = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
  const end = new Date(start);
  end.setUTCHours(23, 59, 59, 999);
  start.setMinutes(start.getMinutes() - IST_OFFSET_MINUTES);
  end.setMinutes(end.getMinutes() - IST_OFFSET_MINUTES);
  return { start, end };
}

async function populateHolidaysForWeek(user_id, week_start) {
  // Create TimesheetDay entries with "Holiday" status on Saturday and Sunday
  for (let i = 5; i <= 6; i++) {
    const holidayDate = new Date(week_start);
    holidayDate.setDate(holidayDate.getDate() + i);
    const targetDay = getISTMidnightUTC(holidayDate);
    const weekly = await prisma.weeklyTimesheet.findFirst({
      where: { user_id, week_start },
    });
    if (!weekly) continue;
    const existing = await prisma.timesheetDay.findFirst({
      where: {
        weekly_timesheet_id: weekly.weekly_timesheet_id,
        date: targetDay,
      },
    });
    if (!existing) {
      await prisma.timesheetDay.create({
        data: {
          weekly_timesheet_id: weekly.weekly_timesheet_id,
          date: targetDay,
          status: "Holiday",
          summary: "Weekend - Holiday",
          created_by: user_id,
        },
      });
    }
  }
}

// --- Controllers ---

// Timesheet entry for manual check-in/out on any allowed date
const TimesheetEntry = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id)
      return res.status(401).json({ message: "Authentication required." });

    const { work_date, check_in, check_out, summary } = req.body;
    if (!work_date || typeof work_date !== "string")
      return res
        .status(400)
        .json({ message: "work_date required as 'YYYY-MM-DD'." });

    const targetDay = getISTMidnightUTC(work_date);

    // Allow fill only for past 7 days and no future
    const todayISTMidnight = getISTMidnightUTC(new Date());
    const diffDays = daysBetween(todayISTMidnight, targetDay);
    if (diffDays > 7 || diffDays < 0)
      return res.status(400).json({
        message: "Date out of allowed range (past 1 week or future).",
      });

    // Get IST weekday
    const istD = new Date(`${work_date}T00:00:00+05:30`);
    const dayOfWeek = istD.getDay();

    // If weekend, create/update holiday and respond
    if ([0, 6].includes(dayOfWeek)) {
      const weekly = await ensureWeeklyTimesheet(user_id, targetDay);
      const existingDay = await prisma.timesheetDay.findFirst({
        where: {
          weekly_timesheet_id: weekly.weekly_timesheet_id,
          date: targetDay,
        },
      });
      if (existingDay) {
        if (existingDay.status !== "Holiday") {
          await prisma.timesheetDay.update({
            where: { timesheetday_id: existingDay.timesheetday_id },
            data: {
              status: "Holiday",
              summary: "Weekend - Holiday",
              check_in: null,
              check_out: null,
              duration: null,
            },
          });
        }
      } else {
        await prisma.timesheetDay.create({
          data: {
            weekly_timesheet_id: weekly.weekly_timesheet_id,
            date: targetDay,
            status: "Holiday",
            summary: "Weekend - Holiday",
            created_by: user_id,
          },
        });
      }
      return res
        .status(200)
        .json({ message: "This day is a Holiday (Weekend)." });
    }

    if (!check_in || !check_out)
      return res.status(400).json({
        message: "Both check_in and check_out are required in 'HH:mm' format.",
      });

    const checkInTime = parseISTTimeOnDate(work_date, check_in);
    const checkOutTime = parseISTTimeOnDate(work_date, check_out);
    if (
      isNaN(checkInTime) ||
      isNaN(checkOutTime) ||
      checkOutTime <= checkInTime
    )
      return res
        .status(400)
        .json({ message: "Invalid check-in/check-out times." });

    const durationHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    let isHalfDay = false;
    let overtimeMinutes = 0;
    if (durationHours >= 4 && durationHours < 5) isHalfDay = true;
    if (durationHours > 8)
      overtimeMinutes = Math.round((durationHours - 8) * 60);

    const weekly = await ensureWeeklyTimesheet(user_id, targetDay);

    const timesheetDay = await prisma.$transaction(async (tx) => {
      const existingDay = await tx.timesheetDay.findFirst({
        where: {
          weekly_timesheet_id: weekly.weekly_timesheet_id,
          date: targetDay,
        },
      });

      const coreData = {
        check_in: checkInTime,
        check_out: checkOutTime,
        summary: summary || (isHalfDay ? "Half Day Worked" : undefined),
        duration: durationHours,
        status: "Filled",
        updated_by: user_id,
      };

      if (existingDay) {
        if (existingDay.status === "Filled") {
          throw new Error(
            "Timesheet for this date already exists and is filled."
          );
        }
        // If you allow refilling for Pending or other statuses, update here
        return await tx.timesheetDay.update({
          where: { timesheetday_id: existingDay.timesheetday_id },
          data: coreData,
        });
      } else {
        return await tx.timesheetDay.create({
          data: {
            weekly_timesheet_id: weekly.weekly_timesheet_id,
            date: targetDay,
            created_by: user_id,
            ...coreData,
          },
        });
      }
    });

    return res.status(200).json({
      timesheetDay: {
        ...timesheetDay,
        date: toISTDateString(timesheetDay.date),
      },
      halfDay: isHalfDay,
      overtimeMinutes,
      message: isHalfDay
        ? "Checked in/out with half day marked."
        : overtimeMinutes > 0
        ? `Checked in/out with ${overtimeMinutes} hrs overtime.`
        : "Timesheet entry filled successfully.",
    });
  } catch (err) {
    if (
      err.message === "Timesheet for this date already exists and is filled."
    ) {
      return res.status(409).json({ message: err.message });
    }

    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

// Leave Controller
const leave = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const employee = await prisma.employee.findFirst({ where: { user_id } });
    if (!employee)
      return res.status(404).json({ message: "Employee doesn't exist." });

    const { leavePeriods, leavetype, reason } = req.body;
    if (!Array.isArray(leavePeriods) || !leavetype) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const expandedDates = [];
    for (const period of leavePeriods) {
      const s = new Date(period.start_date);
      const e = new Date(period.end_date);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        expandedDates.push(new Date(d));
      }
    }

    const todayIST = getISTMidnightUTC(new Date());
    for (const date of expandedDates) {
      const diffDays = daysBetween(todayIST, date);
      if (diffDays > 7) {
        return res.status(400).json({
          message: "Cannot apply for leaves more than 7 days in the past.",
        });
      }
    }

    // Remove duplicated dates
    const uniqueDates = Array.from(
      new Set(expandedDates.map((d) => d.toISOString().slice(0, 10)))
    ).map((dStr) => new Date(dStr));

    await prisma.$transaction(async (tx) => {
      for (const targetDay of uniqueDates) {
        // Get IST weekday of targetDay
        const istDate = new Date(
          targetDay.getTime() + IST_OFFSET_MINUTES * 60 * 1000
        );
        const dayOfWeek = istDate.getDay(); // 0=Sun, 6=Sat

        // Disallow leave application for Saturday or Sunday
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          throw new Error(
            `Cannot apply leave on weekend: ${targetDay
              .toISOString()
              .slice(0, 10)}`
          );
        }

        const { start, end } = getISTDayBounds(targetDay);

        // Existing leave check
        const alreadyLeaveDay = await tx.timesheetDay.findFirst({
          where: {
            weekly_timesheet: { user_id },
            date: { gte: start, lte: end },
            status: "Leave",
          },
        });

        if (alreadyLeaveDay)
          throw new Error(
            `Leave already exists for date ${targetDay
              .toISOString()
              .slice(0, 10)}`
          );
        const weekly = await ensureWeeklyTimesheet(user_id, targetDay);

        const leaveDuration = leavetype === "Halfday" ? 0.5 : 1;

        const leaveRecord = await tx.leave.create({
          data: {
            user_id,
            start_date: getISTMidnightUTC(targetDay),
            end_date: getISTMidnightUTC(targetDay),
            leaveType: leavetype,
            reason: reason || null,
            status: "Pending",
            applied_at: new Date(),
            leave_duration: leaveDuration,
          },
        });

        const existingDay = await tx.timesheetDay.findFirst({
          where: {
            weekly_timesheet_id: weekly.weekly_timesheet_id,
            date: { gte: start, lte: end },
          },
        });

        if (existingDay) {
          await tx.timesheetDay.update({
            where: { timesheetday_id: existingDay.timesheetday_id },
            data: {
              leave_id: leaveRecord.leave_id,
              status: "Leave",
              check_in: null,
              check_out: null,
              summary: reason || "Leave applied",
              updated_by: user_id,
            },
          });
        } else {
          await tx.timesheetDay.create({
            data: {
              weekly_timesheet_id: weekly.weekly_timesheet_id,
              leave_id: leaveRecord.leave_id,
              date: getISTMidnightUTC(targetDay),
              status: "Leave",
              summary: reason || "Leave applied",
              created_by: user_id,
            },
          });
        }
      }
    });

    return res.status(200).json({ message: "Leaves submitted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ message: error.message || "Internal Server Error" });
  }
};

const submitWeeklyTimesheet = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const { week_start } = req.body; // expects 'YYYY-MM-DD'
    if (!user_id || !week_start)
      return res
        .status(400)
        .json({ message: "Missing credentials or week_start" });

    const weekStartObj = getWeekStartIST(week_start);

    // Find weekly timesheet for user and week
    const weekly = await prisma.weeklyTimesheet.findFirst({
      where: { user_id, week_start: weekStartObj },
    });

    if (!weekly)
      return res.status(404).json({ message: "Weekly timesheet not found." });

    if (weekly.status !== "Open")
      return res
        .status(400)
        .json({ message: "Weekly timesheet already submitted." });

    // Fetch week days
    const days = await prisma.timesheetDay.findMany({
      where: { weekly_timesheet_id: weekly.weekly_timesheet_id },
    });

    // Check if all Mon-Fri are Filled or Leave (skipping Holidays)
    let allFilled = true;
    for (let i = 0; i < 7; i++) {
      const istDate = new Date(weekStartObj);
      istDate.setDate(istDate.getDate() + i);
      const dayOfWeek = istDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip Sat/Sun
      const dayRec = days.find(
        (d) => toISTDateString(d.date) === toISTDateString(istDate)
      );
      if (
        !dayRec ||
        (dayRec.status !== "Filled" && dayRec.status !== "Leave")
      ) {
        allFilled = false;
        break;
      }
    }

    if (!allFilled)
      return res
        .status(400)
        .json({
          message:
            "Please fill or apply leave for all working days before submitting.",
        });

    // Update weekly status
    await prisma.weeklyTimesheet.update({
      where: { weekly_timesheet_id: weekly.weekly_timesheet_id },
      data: { status: "Submitted", submitted_at: new Date() },
    });

    return res
      .status(200)
      .json({ message: "Weekly timesheet submitted successfully." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

// Get Weekly Timesheet
const getWeeklyTimesheet = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id)
      return res.status(401).json({ message: "Authentication required." });

    const { date } = req.body || req.query;
    const referenceDate = date ? new Date(date) : new Date();
    if (isNaN(referenceDate.getTime()))
      return res.status(400).json({ message: "Invalid date parameter." });

    const week_start = getWeekStartIST(referenceDate);

    const weeklyTimesheet = await prisma.weeklyTimesheet.findFirst({
      where: { user_id, week_start },
      include: {
        days: {
          include: { leave: true },
          orderBy: { date: "asc" },
        },
      },
    });

    if (!weeklyTimesheet)
      return res.status(404).json({ message: "Weekly timesheet not found." });

    // Generate full week days (Mon-Sun)
    const allDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(week_start);
      d.setDate(d.getDate() + i);
      allDates.push(d.toISOString().slice(0, 10));
    }

    const daysMap = new Map(
      weeklyTimesheet.days.map((day) => [
        day.date.toISOString().slice(0, 10),
        day,
      ])
    );

    const fullWeekDays = allDates.map((dateISO) => {
      if (daysMap.has(dateISO)) return daysMap.get(dateISO);
      return {
        date: dateISO,
        status: "Pending",
        check_in: null,
        check_out: null,
        duration: null,
        summary: null,
        leave: null,
        timesheetday_id: null,
      };
    });

    return res.status(200).json({ ...weeklyTimesheet, days: fullWeekDays });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  TimesheetEntry,
  leave,
  submitWeeklyTimesheet,
  getWeeklyTimesheet,
};
