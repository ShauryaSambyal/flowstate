import { User } from "../models/users.model.js";
import { OTP } from "../models/otp.model.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already registered." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.findOneAndUpdate(
      { email },
      { otp: otpCode },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: `"Trajectory AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verification Code for Trajectory",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px;">
          <h2 style="color: #4F46E5;">Welcome to Trajectory, ${username}!</h2>
          <p>Your future self is waiting. Use the verification code below to activate your account:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; letter-spacing: 4px; color: #111827;">
            ${otpCode}
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This code expires in 5 minutes.</p>
        </div>
      `,
    });

    res.status(200).json({ 
      success: true, 
      message: "OTP sent to your email. Check your inbox!" 
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error while sending OTP." });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { username, email, password, otp } = req.body;
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP expired or not found. Please resend." });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }
    const newUser = new User({
      username,
      email,
      password
    });

    await newUser.save();
    await OTP.deleteOne({ email });

    res.status(201).json({ 
      success: true, 
      message: "Account verified and created successfully!",
      user: { id: newUser._id, username: newUser.username, email: newUser.email }
    });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: "Server error during verification." });
  }
};