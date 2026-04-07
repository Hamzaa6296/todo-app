'use client';
import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TextField, Button, Paper, Typography, Container, Box } from '@mui/material';
import API from '@/api';
import { toast, ToastContainer } from 'react-toastify';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  

  const email = searchParams.get('email');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

  
    if (!email) {
      toast.error("Session error: Email not found in URL. Please signup again.");
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post('/auth/verify-otp', { 
        email: email.trim(), 
        otp: otp.trim() 
      });
      
      toast.success('Verified! Loading login...');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Verify OTP
          </Typography>
          
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
            Please enter the 6-digit code sent to your email.
          </Typography>

          <form onSubmit={handleVerify}>
            <TextField
              fullWidth 
              label="6-Digit Code" 
              required
              value={otp} 
              onChange={(e) => setOtp(e.target.value)}
              inputProps={{ 
                maxLength: 6, 
                style: { textAlign: 'center', letterSpacing: '5px', fontWeight: 'bold' } 
              }}
            />
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              disabled={isSubmitting}
              sx={{ 
                mt: 3, 
                py: 1.5,
                fontWeight: 'bold',
                cursor: 'pointer' 
              }}
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </Paper>
      </Box>
      <ToastContainer position="bottom-right" />
    </Container>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}