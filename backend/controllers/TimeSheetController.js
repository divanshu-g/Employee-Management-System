const prisma = require("../prismaClient");
const { Prisma } = require("@prisma/client");

// --- Date / Time Utilities ---

/**
 * Create an ISO-8601 DateTime string without timezone conversion
 * Format: "YYYY-MM-DDTHH:mm:ss.000Z"
 */
function createISOString(dateStr, hours = 0, minutes = 0, seconds = 0) {
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${dateStr}T${hh}:${mm}:${ss}.000Z`;
}

/**
 * Parse time string "HH:mm" and return hours and minutes
 */
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
}

/**
 * Get current date in IST as "YYYY-MM-DD"
 */
function getTodayIST() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert date string to Date object for comparison
 */
function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Extract date from ISO string "YYYY-MM-DDTHH:mm:ss.000Z" -> "YYYY-MM-DD"
 */
function extractDate(isoString) {
  if (!isoString) return null;
  return isoString.split('T')[0];
}

/**
 * Extract time from ISO string "YYYY-MM-DDTHH:mm:ss.000Z" -> "HH:mm"
 */
function extractTime(isoString) {
  if (!isoString) return null;
  const timePart = isoString.split('T')[1];
  return timePart.substring(0, 5);
}

/**
 * Calculate difference in days between two date strings
 */
function daysBetween(dateStr1, dateStr2) {
  const d1 = parseDate(dateStr1);
  const d2 = parseDate(dateStr2);
  const msDay = 24 * 60 * 60 * 1000;
  return Math.floor((d1 - d2) / msDay);
}

/**
 * Get the day of week for a date string (0=Sunday, 6=Saturday)
 */
function getDayOfWeek(dateStr) {
  const date = parseDate(dateStr);
  return date.getDay();
}

/**
 * Get the Monday of the week for a given date string, returns ISO string
 */
function getWeekStart(dateStr) {
  const date = parseDate(dateStr);
  const day = date.getDay();
  const diffToMonday = (day + 6) % 7;
  date.setDate(date.getDate() - diffToMonday);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(date.getDate()).padStart(2, '0');
  
  return createISOString(`${year}-${month}-${dayOfMonth}`);
}

/**
 * Convert Date object to "YYYY-MM-DD" string
 */
function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a date string
 */
function addDays(dateStr, days) {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

/**
 * Calculate duration in hours between two time strings on the same date
 */
function calculateDuration(checkInTime, checkOutTime) {
  const cin = parseTime(checkInTime);
  const cout = parseTime(checkOutTime);
  
  const checkInMinutes = cin.hours * 60 + cin.minutes;
  const checkOutMinutes = cout.hours * 60 + cout.minutes;
  
  return (checkOutMinutes - checkInMinutes) / 60;
}

// --- DB / Timesheet Helpers ---

async function populateHolidaysForWeek(user_id, week_start_iso, tx = prisma) {
  // Extract base date from week_start ISO string
  const baseDate = extractDate(week_start_iso);
  
  // Saturday is 5 days after Monday, Sunday is 6 days after Monday
  const saturdayStr = addDays(baseDate, 5);
  const sundayStr = addDays(baseDate, 6);
  
  const saturdayISO = createISOString(saturdayStr);
  const sundayISO = createISOString(sundayStr);

  const existing = await tx.timesheetDay.findMany({
    where: {
      weekly_timesheet: {
        user_id,
        week_start: week_start_iso,
      },
      date: { in: [saturdayISO, sundayISO] },
    },
    select: { date: true },
  });
  
  const existingSet = new Set(existing.map((e) => extractDate(e.date)));

  const creations = [];
  
  if (!existingSet.has(saturdayStr)) {
    creations.push(
      tx.timesheetDay.create({
        data: {
          weekly_timesheet: {
            connect: {
              user_id_week_start: {
                user_id,
                week_start: week_start_iso,
              },
            },
          },
          date: saturdayISO,
          status: "Holiday",
          summary: "Weekend - Holiday",
          created_by: user_id,
        },
      })
    );
  }
  
  if (!existingSet.has(sundayStr)) {
    creations.push(
      tx.timesheetDay.create({
        data: {
          weekly_timesheet: {
            connect: {
              user_id_week_start: {
                user_id,
                week_start: week_start_iso,
              },
            },
          },
          date: sundayISO,
          status: "Holiday",
          summary: "Weekend - Holiday",
          created_by: user_id,
        },
      })
    );
  }
  
  await Promise.all(creations);
}

async function ensureWeeklyTimesheet(user_id, dateStr) {
  const week_start = getWeekStart(dateStr);
  let weekly = await prisma.weeklyTimesheet.findFirst({
    where: { user_id, week_start },
  });
  if (!weekly) {
    try {
      weekly = await prisma.weeklyTimesheet.create({
        data: { user_id, week_start },
      });
      await populateHolidaysForWeek(user_id, week_start);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        weekly = await prisma.weeklyTimesheet.findFirst({
          where: { user_id, week_start },
        });
      } else {
        throw err;
      }
    }
  }
  return weekly;
}

// --- Controllers ---

async function TimesheetEntry(req, res) {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) return res.status(401).json({ message: "Authentication required." });

    const { work_date, check_in, check_out, summary } = req.body;
    if (!work_date || typeof work_date !== "string") {
      return res
        .status(400)
        .json({ message: "work_date required as 'YYYY-MM-DD'." });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(work_date)) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    const todayStr = getTodayIST();
    const diff = daysBetween(todayStr, work_date);
    if (diff > 7 || diff < 0) {
      return res.status(400).json({
        message: "Date out of allowed range (past 7 days or future).",
      });
    }

    // Determine weekday
    const weekday = getDayOfWeek(work_date);

    // If weekend (Saturday=6 or Sunday=0), mark holiday
    if (weekday === 6 || weekday === 0) {
      const weekly = await ensureWeeklyTimesheet(user_id, work_date);
      const targetISO = createISOString(work_date);
      
      const existing = await prisma.timesheetDay.findFirst({
        where: {
          weekly_timesheet_id: weekly.weekly_timesheet_id,
          date: targetISO,
        },
      });
      
      if (existing) {
        if (existing.status !== "Holiday") {
          await prisma.timesheetDay.update({
            where: { timesheetday_id: existing.timesheetday_id },
            data: {
              status: "Holiday",
              summary: "Weekend - Holiday",
              check_in: null,
              check_out: null,
              duration: null,
              leave_id: null,
              updated_by: user_id,
            },
          });
        }
      } else {
        await prisma.timesheetDay.create({
          data: {
            weekly_timesheet_id: weekly.weekly_timesheet_id,
            date: targetISO,
            status: "Holiday",
            summary: "Weekend - Holiday",
            created_by: user_id,
          },
        });
      }
      return res.status(200).json({ message: "This day is a Holiday (Weekend)." });
    }

    if (!check_in || !check_out) {
      return res
        .status(400)
        .json({ message: "Both check_in and check_out are required in 'HH:mm' format." });
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(check_in) || !/^\d{2}:\d{2}$/.test(check_out)) {
      return res.status(400).json({ message: "Invalid time format. Use HH:mm." });
    }

    const ciParsed = parseTime(check_in);
    const coParsed = parseTime(check_out);
    
    const duration = calculateDuration(check_in, check_out);
    
    if (duration <= 0) {
      return res.status(400).json({ message: "Check-out must be after check-in." });
    }

    let isHalf = false;
    let overtimeMin = 0;
    if (duration >= 4 && duration < 5) isHalf = true;
    if (duration > 8) overtimeMin = Math.round((duration - 8) * 60);

    const weekly = await ensureWeeklyTimesheet(user_id, work_date);
    if (weekly.status === "Submitted" || weekly.status === "Approved") {
      return res
        .status(400)
        .json({ message: "Cannot modify timesheet for a submitted/approved week." });
    }

    const targetISO = createISOString(work_date);
    const checkInISO = createISOString(work_date, ciParsed.hours, ciParsed.minutes);
    const checkOutISO = createISOString(work_date, coParsed.hours, coParsed.minutes);

    const dayRecord = await prisma.$transaction(async (tx) => {
      const existing = await tx.timesheetDay.findFirst({
        where: {
          weekly_timesheet_id: weekly.weekly_timesheet_id,
          date: targetISO,
        },
      });
      
      const core = {
        check_in: checkInISO,
        check_out: checkOutISO,
        summary: summary || (isHalf ? "Half Day Worked" : undefined),
        duration,
        status: "Filled",
        updated_by: user_id,
      };

      if (existing) {
        if (existing.status === "Filled") {
          throw new Error("Timesheet for this date already exists and is filled.");
        }
        return tx.timesheetDay.update({
          where: { timesheetday_id: existing.timesheetday_id },
          data: core,
        });
      } else {
        return tx.timesheetDay.create({
          data: {
            weekly_timesheet_id: weekly.weekly_timesheet_id,
            date: targetISO,
            created_by: user_id,
            ...core,
          },
        });
      }
    });

    return res.status(200).json({
      timesheetDay: {
        timesheetday_id: dayRecord.timesheetday_id,
        weekly_timesheet_id: dayRecord.weekly_timesheet_id,
        date: work_date,
        check_in: check_in,
        check_out: check_out,
        duration: dayRecord.duration,
        summary: dayRecord.summary,
        status: dayRecord.status,
      },
      halfDay: isHalf,
      overtimeMinutes: overtimeMin,
      message: isHalf
        ? "Checked in/out with half day marked."
        : overtimeMin > 0
        ? `Checked in/out with ${overtimeMin} minutes overtime.`
        : "Timesheet entry filled successfully.",
    });
  } catch (err) {
    if (err.message === "Timesheet for this date already exists and is filled.") {
      return res.status(409).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}

// async function leave(req, res) {
//   try {
//     const user_id = req.user?.user_id;
//     if (!user_id) return res.status(401).json({ message: "Authentication required." });

//     const employee = await prisma.employee.findFirst({ where: { user_id } });
//     if (!employee) {
//       return res.status(404).json({ message: "Employee doesn't exist." });
//     }

//     const { leavePeriods, leavetype, reason } = req.body;
//     if (!Array.isArray(leavePeriods) || !leavetype) {
//       return res.status(400).json({ message: "Invalid request." });
//     }

//     const periods = leavePeriods.map((p) => {
//       if (!/^\d{4}-\d{2}-\d{2}$/.test(p.start_date) || !/^\d{4}-\d{2}-\d{2}$/.test(p.end_date)) {
//         throw new Error("Invalid date format. Use YYYY-MM-DD");
//       }
//       const s = parseDate(p.start_date);
//       const e = parseDate(p.end_date);
//       if (s > e) {
//         throw new Error("Start date cannot be after end date");
//       }
//       return { start: p.start_date, end: p.end_date };
//     });

//     const todayStr = getTodayIST();
//     for (const { start } of periods) {
//       if (daysBetween(todayStr, start) > 7) {
//         return res.status(400).json({
//           message: "Cannot apply for leaves more than 7 days in the past.",
//         });
//       }
//     }

//     const errors = [];
//     const successes = [];

//     for (const { start, end } of periods) {
//       await prisma.$transaction(async (tx) => {
//         const leaveDur = leavetype === "Halfday" ? 0.5 : 1;
//         const leaveRecord = await tx.leave.create({
//           data: {
//             user_id,
//             start_date: createISOString(start),
//             end_date: createISOString(end),
//             leaveType: leavetype,
//             reason: reason || null,
//             status: "Pending",
//             applied_at: new Date(),
//             leave_duration: leaveDur,
//           },
//         });

//         // Iterate through each day in the leave period
//         let currentDate = start;
//         while (daysBetween(currentDate, end) <= 0) {
//           const weekday = getDayOfWeek(currentDate);

//           // Check if Saturday (6) or Sunday (0)
//           if (weekday === 6 || weekday === 0) {
//             const weekly = await ensureWeeklyTimesheet(user_id, currentDate);
//             const targetISO = createISOString(currentDate);
            
//             const existing = await tx.timesheetDay.findFirst({
//               where: {
//                 weekly_timesheet_id: weekly.weekly_timesheet_id,
//                 date: targetISO,
//               },
//             });
            
//             if (existing) {
//               if (existing.status !== "Holiday") {
//                 await tx.timesheetDay.update({
//                   where: { timesheetday_id: existing.timesheetday_id },
//                   data: {
//                     status: "Holiday",
//                     summary: "Weekend - Holiday",
//                     check_in: null,
//                     check_out: null,
//                     duration: null,
//                     leave_id: null,
//                     updated_by: user_id,
//                   },
//                 });
//               }
//             } else {
//               await tx.timesheetDay.create({
//                 data: {
//                   weekly_timesheet_id: weekly.weekly_timesheet_id,
//                   date: targetISO,
//                   status: "Holiday",
//                   summary: "Weekend - Holiday",
//                   created_by: user_id,
//                 },
//               });
//             }
//             currentDate = addDays(currentDate, 1);
//             continue;
//           }

//           const weekly = await ensureWeeklyTimesheet(user_id, currentDate);
//           const targetISO = createISOString(currentDate);
          
//           const existing = await tx.timesheetDay.findFirst({
//             where: {
//               weekly_timesheet_id: weekly.weekly_timesheet_id,
//               date: targetISO,
//             },
//           });
          
//           if (existing && existing.status === "Leave") {
//             throw new Error(`Leave already exists for date ${currentDate}`);
//           }
          
//           if (existing) {
//             await tx.timesheetDay.update({
//               where: { timesheetday_id: existing.timesheetday_id },
//               data: {
//                 leave_id: leaveRecord.leave_id,
//                 status: "Leave",
//                 check_in: null,
//                 check_out: null,
//                 summary: reason || "Leave applied",
//                 updated_by: user_id,
//               },
//             });
//           } else {
//             await tx.timesheetDay.create({
//               data: {
//                 weekly_timesheet_id: weekly.weekly_timesheet_id,
//                 leave_id: leaveRecord.leave_id,
//                 date: targetISO,
//                 status: "Leave",
//                 summary: reason || "Leave applied",
//                 created_by: user_id,
//               },
//             });
//           }
          
//           currentDate = addDays(currentDate, 1);
//         }
        
//         successes.push({
//           start: start,
//           end: end,
//           leave_id: leaveRecord.leave_id,
//         });
//       }).catch((er) => {
//         console.error("Leave error", er.message || er);
//         errors.push({
//           period: { start, end },
//           error: er.message || "Failed",
//         });
//       });
//     }

//     if (errors.length > 0) {
//       return res.status(207).json({
//         message: "Leaves processed with some errors",
//         successes,
//         errors,
//       });
//     }
//     return res.status(200).json({ message: "Leaves submitted successfully", successes });
//   } catch (err) {
//     console.error(err);
//     return res.status(400).json({ message: err.message || "Internal Server Error" });
//   }
// }

// async function getWeeklyTimesheet(req, res) {
//   try {
//     const user_id = req.user?.user_id;
//     if (!user_id) return res.status(401).json({ message: "Authentication required." });

//     const { date } = req.query || req.body;
//     const refDate = date || getTodayIST();
    
//     const week_start = getWeekStart(refDate);
//     const weekly = await prisma.weeklyTimesheet.findFirst({
//       where: { user_id, week_start },
//       include: {
//         days: {
//           include: { leave: true },
//           orderBy: { date: "asc" },
//         },
//       },
//     });
    
//     if (!weekly) {
//       return res.status(404).json({ message: "Weekly timesheet not found." });
//     }

//     // Generate all 7 days of the week
//     const weekStartDate = extractDate(week_start);
//     const fullDays = [];
//     for (let i = 0; i < 7; i++) {
//       fullDays.push(addDays(weekStartDate, i));
//     }

//     const mapDays = new Map(
//       weekly.days.map((day) => {
//         const dateStr = extractDate(day.date);
//         return [dateStr, day];
//       })
//     );

//     const resultDays = fullDays.map((dateStr) => {
//       if (mapDays.has(dateStr)) {
//         const d = mapDays.get(dateStr);
//         return {
//           timesheetday_id: d.timesheetday_id,
//           weekly_timesheet_id: d.weekly_timesheet_id,
//           leave_id: d.leave_id,
//           date: dateStr,
//           check_in: extractTime(d.check_in),
//           check_out: extractTime(d.check_out),
//           duration: d.duration,
//           summary: d.summary,
//           status: d.status,
//           leave: d.leave,
//         };
//       }
//       return {
//         date: dateStr,
//         status: "Pending",
//         check_in: null,
//         check_out: null,
//         duration: null,
//         summary: null,
//         leave: null,
//         timesheetday_id: null,
//       };
//     });

//     return res.status(200).json({
//       weekly_timesheet_id: weekly.weekly_timesheet_id,
//       user_id: weekly.user_id,
//       week_start: weekStartDate,
//       status: weekly.status,
//       submitted_at: weekly.submitted_at,
//       approved_at: weekly.approved_at,
//       approved_by: weekly.approved_by,
//       days: resultDays,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Internal Server Error", error: err.message });
//   }
// }

module.exports = {
  TimesheetEntry
};