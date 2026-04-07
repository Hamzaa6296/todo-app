'use client';
import React, { useState, useEffect } from 'react';
import { TextField, Button, Paper, Typography, Container, Box, Link, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import API from '@/api';
import { toast, ToastContainer } from 'react-toastify';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        router.prefetch('/dashboard');
        router.prefetch('/signup');
        router.prefetch('/forgot-password');
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data } = await API.post('/auth/login', { email, password });

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('userId', data.user.id);


            router.push('/dashboard');
            toast.success('Login Successful!');
        } catch (err: any) {
            setIsSubmitting(false);
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
                    <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>Login</Typography>
                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label="Email"
                            margin="normal"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            margin="normal"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{ mt: 3, mb: 2, py: 1.5, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>

                        <Box display="flex" justifyContent="space-between">

                            <Link href="/reset-password" variant="body2" style={{ cursor: 'pointer' }}>
                                Forgot Password?
                            </Link>
                            <Link href="/signup" variant="body2" style={{ cursor: 'pointer' }}>
                                Create Account
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
            <ToastContainer position="bottom-center" autoClose={2000} theme="dark" />
        </Container>
    );
}