const primsa = require("../prismaClient");

const createPosition = async (req, res) => {
    
  const {
    position_title,
    position_code,
    job_description,
    required_skills,
    salary,
    is_active,
    position_level,
    department_id,
  } = req.body;

  try {
    if (
      !position_title ||
      !position_code ||
      !department_id ||
      !salary ||
      !position_level
    ) {
      return res
        .status(400)
        .json({
          message:
            "Missing required fields: position_title, position_code, department_id, salary, and position_level are all required.",
        });
    }
    console.log("22222222222222222222", req.body);
    
    const position = await primsa.position.create({
      data: {
        position_title,
        position_code,
        job_description,
        required_skills,
        salary,
        position_level,
        department_id,
      },
    });
    console.log(position);
    
    return res.status(201).json({ message: "Position created", position });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getAllPositions = async (req, res) => {
  try {
    const positions = await primsa.position.findMany();
    return res.status(200).json({ positions });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPositionsById = async (req, res) => {
  const position_id = parseInt(req.params.id, 10);

  try {
    const position = await primsa.position.findUnique({
      where: { position_id: position_id },
    });

    return res.status(200).json({ position });
  } catch (error) {
    if (error.code == "P2005") {
      return res.status(403).json({ message: "Position not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPositionByCode = async(req, res) => {
  const position_id = req.params.code;
  
  try{
    const positionCode = await primsa.position.findUnique({
      where: {position_code: position_id}
    })
    if(!positionCode){
      return res.status(400).json({message: "Give Position code"})
    }
    return res.status(200).json({message: "Position", positionCode})
  }catch(error){
    if(error.code == "P2005"){
      return res.status(404).json({message: "Position not found"})
    }
    return res.status(500).json({message: "Internal server error"})

  }
}

const updatePosition = async (req, res) => {
  const position_id = parseInt(req.params.id, 10);
  const {
    position_title,
    position_code,
    job_description,
    required_skills,
    salary,
    is_active,
    position_level,
    department_id,
  } = req.body;

  try {
    const position = await primsa.position.update({
      where: { position_id: position_id },
      data: {
        position_title,
        position_code,
        job_description,
        required_skills,
        salary,
        is_active,
        position_level,
        department_id
       },
    });
    return res.status(200).json({ message: "Position updated", position });
  } catch (error) {
    if (error.code == "P2005") {
      return res.status(404).json({ message: "Position not found", error: error.message });
    }
    if (error.code == "P2002") {
      return res.status(409).json({ message: "Position already exists" });
    }
    return res.status(500).json({ message: "Internal server error", error:error.message });
  }
};

const deletePosition = async (req, res) => {
  const position_id = parseInt(req.params.id, 10);

  try {
    const position = await primsa.position.update({
      where: { position_id: position_id },
      data: { is_active: false },
    });

    return res.status(200).json({ message: "Position deleted", position });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const activatePosition = async (req, res) => {
  const position_id = parseInt(req.params.id, 10);

  try {
    const position = await primsa.position.update({
      where: { position_id: position_id },
      data: { is_active: true },
    });

    return res.status(200).json({ message: "Position deleted", position });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createPosition,
  getAllPositions,
  getPositionsById,
  getPositionByCode,
  updatePosition,
  deletePosition,
  activatePosition
};
