import * as nodemailer from 'nodemailer';
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) { }

  private async sendEmail(to: string, subject: string, otp: string | number) {
    const mailOptions = {
      from: '"Todo Task Support" <ali.hamzaaa6296@gmail.com>',
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2>Security Verification</h2>
          <p>Your one-time password (OTP) is:</p>
          <h1 style="color: #1976d2; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire shortly.</p>
        </div>
      `,
    };
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new BadRequestException('Failed to send email.');
    }
  }

  async signUp(email: string, password: string) {
    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await this.userModel.findOne({ email: cleanEmail });

    if (existingUser) {
      if (!existingUser.isVerified) {
        const newOtp = Math.floor(100000 + Math.random() * 900000);
        existingUser.otp = newOtp;
        existingUser.password = await bcrypt.hash(password, 10);
        await existingUser.save();
        await this.sendEmail(cleanEmail, 'Verify Your Account', newOtp);
        return { message: 'User already exists. New OTP sent to email.' };
      }
      throw new BadRequestException('Email already registered and verified.');
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);

    try {
   
      await this.userModel.create({ email: cleanEmail, password: hashedPass, otp });
   
      this.sendEmail(cleanEmail, 'Verify Your Account', otp).catch(e => console.error(e));
      
      return { message: 'Signup successful. Please check your email for OTP.' };
    } catch (error) {
      console.error("DB_SIGNUP_ERROR:", error);
      throw new BadRequestException('Signup failed. Please try again.');
    }
  }

  async verifyOtp(email: string, otp: string) {
    const cleanEmail = email?.toLowerCase().trim();
    const user = await this.userModel.findOne({ email: cleanEmail });

    console.log('--- DEBUG ---', { email: cleanEmail, inputOtp: otp, dbOtp: user?.otp });

    if (!user || Number(user.otp) !== Number(otp)) {
      throw new BadRequestException('Invalid OTP');
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    return { message: 'Account verified!' };
  }

  async login(email: string, pass: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isVerified) throw new UnauthorizedException('Please verify email first');

    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: { email: user.email, id: user._id },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw new BadRequestException('User not found');
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    await user.save();
    await this.sendEmail(user.email, 'Password Reset OTP', otp);
    return { message: 'Reset OTP sent.' };
  }

  async resetPassword(email: string, otp: string, newPass: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase().trim() });
    if (!user || Number(user.otp) !== Number(otp)) {
      throw new BadRequestException('Invalid OTP');
    }
    user.password = await bcrypt.hash(newPass, 10);
    user.otp = undefined;
    await user.save();
    return { message: 'Password changed successfully' };
  }
}