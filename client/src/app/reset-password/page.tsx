'use client';
import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Container, Box } from '@mui/material';
import API from '@/api';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'User not found');
    } finally {
      setLoading(false);
    }
  };

 
  const handleGoToReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Enter full 6-digit code");
    setStep(3);
  };

 
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      toast.success('Password updated! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP or session expired');
      setStep(2); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          
      
          {step === 1 && (
            <form onSubmit={handleRequestOtp}>
              <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                Forgot Password
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                Enter your email to receive a reset code.
              </Typography>
              <TextField
                fullWidth label="Email Address" required
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                type="submit" fullWidth variant="contained" disabled={loading}
                sx={{ mt: 3, py: 1.5, cursor: 'pointer', fontWeight: 'bold' }}
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          )}

          
          {step === 2 && (
            <form onSubmit={handleGoToReset}>
              <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                Verify OTP
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                Enter the 6-digit code sent to <b>{email}</b>
              </Typography>
              <TextField
                fullWidth label="6-Digit Code" required
                value={otp} onChange={(e) => setOtp(e.target.value)}
                inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '5px' } }}
              />
              <Button 
                type="submit" fullWidth variant="contained"
                sx={{ mt: 3, py: 1.5, cursor: 'pointer', fontWeight: 'bold' }}
              >
                Continue
              </Button>
            </form>
          )}

         
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                New Password
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                Create a strong new password.
              </Typography>
              <TextField
                fullWidth label="New Password" type="password" required
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button 
                type="submit" fullWidth variant="contained" color="success" disabled={loading}
                sx={{ mt: 3, py: 1.5, cursor: 'pointer', fontWeight: 'bold' }}
              >
                {loading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          )}

        </Paper>
      </Box>
      <ToastContainer position="bottom-right" />
    </Container>
  );
}