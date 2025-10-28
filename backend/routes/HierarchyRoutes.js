const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const manage_roles = ["superAdmin", "subAdmin"];
const { createUser , changeTeam} = require("micro_service-ems");
const prisma = require("../prismaClient");

router.post(
  "/adduser/:user_Id/:prev_Id",
  // authMiddleware,
  // roleMiddleware(manage_roles),
  async (req, res) => {
    try{
      // console.log(req.params.user_Id);
        const result = await createUser(prisma, "Hierarchy", req.params);
        res.status(200).json(result);
    }catch(err){
        res.status(400).json(err.message);
    }
  }
);

router.post("/changeteam/:user_Id/:new_prev_Id",async(req,res)=>{
    try{
      const ans = await changeTeam(prisma,"Hierarchy",req.params)
      res.status(200).json(ans);
    }catch(err){
      res.status(400).json(err.message);
    }
})

module.exports = router;

