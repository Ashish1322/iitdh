const User = require("../models/User");
const Messages = require("../models/Messages");
const Appointment = require("../models/Appointments");
const Departments = require("../models/Department");
const Appointments = require("../models/Appointments");

const updateProfile = async (req, res) => {
  const { name, phone, about, address } = req.body;

  // Validation
  if (!name || name.length < 3)
    return res
      .status(400)
      .json({ success: false, message: "Name should be minimum 3 chars" });

  try {
    await User.findByIdAndUpdate(req.user._id, {
      name: name,
      phoneNumber: phone,
      about: about,
      address: address,
    });

    return res.status(200).json({ success: true, message: "Details Updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfliePhoto = async (req, res) => {
  if (req.file) {
    await User.findByIdAndUpdate(req.user._id, {
      imgUrl: req.file.location,
    });
    return res.status(200).json({
      success: true,
      message: "Profile Photo uploaded",
      imgUrl: req.file.location,
    });
  }
  return res
    .status(400)
    .json({ success: false, message: "File is not provided" });
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "DOCTOR", active: true })
      .select("name address gender email _id imgUrl phoneNumber about")
      .populate("departmentId");

    return res.status(200).json({ success: true, doctors });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllpatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "PATIENT", active: true }).select(
      "name address gender email _id imgUrl phoneNumber"
    );

    return res.status(200).json({ success: true, patients });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPatientByName = async (req, res) => {
  const { name } = req.params;
  try {
    const patients = await User.find({
      $text: { $search: name },
      role: "PATIENT",
      active: true,
    }).select("name address gender email _id imgUrl phoneNumber");

    return res.status(200).json({ success: true, patients });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const messageId =
      req.user._id >= receiverId
        ? req.user._id + receiverId
        : receiverId + req.user._id;
    const messages = await Messages.find({ messageId });

    res.status(200).json({ success: true, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Invalid Request" });
  }
};

// Only for Websockt
const sendMessage = async (payload, file) => {
  const { senderId, receiverId, message } = payload;
  const messageId =
    senderId >= receiverId ? senderId + receiverId : receiverId + senderId;
  const messageDoc = await Messages.create({
    sender: senderId,
    receiver: receiverId,
    content: message,
    messageId,
    file,
  });
  return messageDoc;
};

// SLOTS

// Open Slot : Doctor
const openSlot = async (req, res) => {
  const { start, end } = req.body;
  console.log(start, end);
  // is slot aready opened
  const slot = await Appointment.findOne({
    openedBy: req.user._id,
    start,
    end,
  });
  console.log(slot);
  if (slot) {
    return res
      .status(400)
      .json({ success: false, message: "This slot already opened" });
  }

  const newSlot = await Appointment.create({
    openedBy: req.user._id,
    start,
    end,
  });

  return res
    .status(200)
    .json({ success: true, message: "Slot Opened", newSlot });
};

// Read Slot : Doctor
const getAllDoctorSlots = async (req, res) => {
  const slots = await Appointment.find({ openedBy: req.user._id }).populate(
    "bookedBy",
    "name email imgUrl _id"
  );
  return res.status(200).json({ success: true, slots });
};

// Read Slot : Patient
const getAllPatientSlots = async (req, res) => {
  const slots = await Appointment.find({ bookedBy: req.user._id }).populate(
    "openedBy",
    "name email imgUrl _id"
  );
  return res.status(200).json({ success: true, slots });
};

// Delete slot: Doctor
const deleteSlot = async (req, res) => {
  const { slotId } = req.params;
  const del = await Appointment.findOneAndDelete({
    _id: slotId,
    openedBy: req.user._id,
    isBooked: false,
  });
  if (del) {
    return res.status(200).json({ success: true, message: "Slot Deleted" });
  }
  return res.status(500).json({ success: true, message: "Invalid Details" });
};

// Patients
const getDoctorByName = async (req, res) => {
  const { name } = req.params;
  try {
    const doctors = await User.find({
      $text: { $search: name },
      role: "DOCTOR",
      active: true,
    })
      .select("name address gender email _id imgUrl phoneNumber about")
      .populate("departmentId");

    return res.status(200).json({ success: true, doctors });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getDoctorByDepartment = async (req, res) => {
  const { dpartmentId } = req.params;
  const doctors = await User.find({
    active: true,
    role: "DOCTOR",
    departmentId: dpartmentId,
  })
    .select("name address gender email _id imgUrl phoneNumber about")
    .populate("departmentId");
  return res.status(200).json({ success: true, doctors });
};

const getAllDepartments = async (req, res) => {
  const departments = await Departments.find();
  return res.status(200).json({ success: true, departments });
};

// Patients
const getAllDoctorAvailabeSlots = async (req, res) => {
  const { doctorId } = req.params;
  console.log(doctorId);
  const slots = await Appointment.find({ openedBy: doctorId, isBooked: false });
  return res.status(200).json({ success: true, slots });
};

const bookSlot = async (req, res) => {
  const { slotId } = req.params;
  const changed = await Appointments.findOneAndUpdate(
    {
      _id: slotId,
      isBooked: false,
    },
    {
      bookedBy: req.user._id,
      isBooked: true,
    }
  );
  if (!changed)
    return res.status(500).json({ success: false, message: "Invalid Slot" });

  return res.status(200).json({ success: true, message: "Slot Booked" });
};
module.exports = {
  updateProfile,
  updateProfliePhoto,
  getAllDoctors,
  getAllpatients,
  getAllMessages,
  sendMessage,
  getPatientByName,
  openSlot,
  getAllDoctorSlots,
  deleteSlot,
  getDoctorByName,
  getDoctorByDepartment,
  getAllDepartments,
  getAllDoctorAvailabeSlots,
  bookSlot,
  getAllPatientSlots,
};
