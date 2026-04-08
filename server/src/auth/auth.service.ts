import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as Brevo from '@getbrevo/brevo'; // Import the whole namespace

@Injectable()
export class AuthService {
  // 1. Initialize the new BrevoClient
  private readonly brevo = new Brevo.BrevoClient({
    apiKey: process.env.BREVO_API_KEY as string,
  });

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  private async sendEmail(to: string, subject: string, otp: string | number) {
    try {
      // 2. Use the new v5.x path: .transactionalEmails.sendTransacEmail
      await this.brevo.transactionalEmails.sendTransacEmail({
        subject: subject,
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
            <h2>Verify Your Account</h2>
            <p>Your OTP code is: <b style="font-size: 24px; color: #007bff;">${otp}</b></p>
          </div>`,
        sender: { name: "Todo App Support", email: "ah9132517@gmail.com" },
        to: [{ email: to }],
      });
      console.log('✅ Email sent via Brevo to:', to);
    } catch (error) {
      console.error('❌ Brevo Error:', error instanceof Error ? error.message : String(error));
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
        this.sendEmail(cleanEmail, 'Verify Your Account', newOtp);
        return { message: 'User already exists. New OTP sent.' };
      }
      throw new BadRequestException('Email already registered.');
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);

    try {
      // Create user in DB first
      await this.userModel.create({ email: cleanEmail, password: hashedPass, otp });
      
      // Send email in background
      this.sendEmail(cleanEmail, 'Verify Your Account', otp);

      return { message: 'Signup successful. Check your email for OTP.' };
    } catch (error) {
      console.error("DB_SIGNUP_ERROR:", error);
      throw new BadRequestException('Signup failed. Check Atlas IP Whitelist.');
    }
  }

  async verifyOtp(email: string, otp: string) {
    const cleanEmail = email?.toLowerCase().trim();
    const user = await this.userModel.findOne({ email: cleanEmail });
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
    this.sendEmail(user.email, 'Password Reset OTP', otp);
    return { message: 'If this email exists, an OTP has been sent.' };
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