const MrModel = require('../models/mr');
const bcrypt = require('bcrypt');



const createMr = async (req, res) => {
    try {
        const { DIV, STATE, MRCODE, PASSWORD, MRNAME, HQ, DESG, DOJ, EFF_DATE } = req.body;
        console.log(typeof PASSWORD);

        const mr = await MrModel.findOne({ MRCODE: MRCODE });
        if (mr) {
            return res.status(400).json({
                msg: "Mr Already Exists",
                success: false
            })
        }
        const newMr = new MrModel({
            DIV,
            STATE,
            MRCODE,
            PASSWORD,
            MRNAME,
            HQ,
            DESG,
            DOJ,
            EFF_DATE
        });
        // Save the new MR to the database
        await newMr.save();
        return res.status(201).json({
            msg: 'MR created successfully',
            success: true,
            mr: newMr,
        });
    } catch (error) {
        const errMsg = error.message
        console.log("Error in CreateMr");
        return res.status(500).json({
            success: false,
            errMsg
        })
    }
}


const loginMr = async (req, res) => {
    try {
        const { MRCODE, PASSWORD } = req.body;
        const mr = await MrModel.findOne({ MRCODE: MRCODE });
        if (!mr) {
            return res.status(400).json({
                msg: "Mr not Found",
                success: false
            })
        } else {
            if (PASSWORD == mr.PASSWORD) {
                mr.loginLogs.push({
                    timestamp: new Date(),
                    cnt: mr.loginLogs.length + 1
                });
                await mr.save();
                return res.status(200).json({
                    msg: "Login Done",
                    success: true,
                    mr
                })
            } else {
                return res.status(400).json({
                    msg: "Password is not correct",
                    success: false
                })
            }
        }
    }
    catch (error) {
        const errMsg = error.message
        console.log("Error in loginMr");
        return res.status(500).json({
            success: false,
            errMsg
        })
    }
}



const getDoctorForThisMr = async (req, res) => {
    try {

        const id = req.params['id'];
        console.log(id);
        const mr = await MrModel.findById({ _id: id }).populate('doctors').select("-_id -DIV -STATE -MRCODE -PASSWORD -MRNAME -HQ -DESG -DOJ -EFF_DATE -loginLogs");
        console.log(mr);

        if (!mr) {
            return res.status(400).json({
                msg: "No Doctor Found For This MR",
                success: false
            });
        }


        const doctorsArray = mr.doctors.map(doctor => ({
            id: doctor._id,
            doctorName: doctor.DRNAME,
            doctorSpecialty: doctor.SPECIALITY,
            doctorLocality: doctor.LOCALITY,
            doctorState: doctor.STATE,
            doctorMobileNo: doctor.MOBILENO,

        }));

        return res.status(200).json(doctorsArray);
    } catch (error) {
        const errMsg = error.message;
        console.log("Error in getDoctorForThisMr");
        return res.status(500).json({
            success: false,
            errMsg
        });
    }
};

const getAllMR = async (req, res) => {

    try {
        const mrs = await MrModel.find({}).select("_id MRNAME");
        if (!mrs) return res.status(400);
        return res.json(mrs);
    }
    catch (error) {
        const errMsg = error.message
        console.log("Error in loginMr");
        return res.status(500).json({
            success: false,
            errMsg
        })
    }
}




module.exports = {
    createMr,
    loginMr,
    getDoctorForThisMr,
    getAllMR
}
