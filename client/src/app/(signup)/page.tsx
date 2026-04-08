'use client';
import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Button, Typography,
    CircularProgress, Paper, Container, Link
} from '@mui/material';
import { useRouter } from 'next/navigation';
import API from '@/api';
import { toast, ToastContainer } from 'react-toastify';

export default function SignupPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        router.prefetch('/login');
        router.prefetch('/verify-otp'); 
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await API.post('/auth/signup', formData);

            if (res.status === 201 || res.status === 200) {
                toast.success("OTP sent to your email!");
                router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
            }
        } catch (err: any) {
            setIsSubmitting(false);
            toast.error(err.response?.data?.message || "Signup failed");
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: '16px' }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: '700', textAlign: 'center' }}>
                        Create Account
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            margin="normal"
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={isSubmitting}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            margin="normal"
                            required
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            disabled={isSubmitting}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                mt: 3,
                                height: '50px',
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSubmitting ? (
                                <CircularProgress size={24} sx={{ color: '#fff' }} />
                            ) : (
                                "Sign Up"
                            )}
                        </Button>

                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Link href="/login" variant="body2" sx={{ cursor: 'pointer', textDecoration: 'none' }}>
                                Already have an account? Sign In
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
            <ToastContainer position="bottom-center" theme="dark" autoClose={3000} />
        </Container>
    );
}