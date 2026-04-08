'use client';
import React, { useState, useEffect } from 'react';
import {
    Button, Box, Typography, Paper,
    List, ListItem, ListItemText, IconButton, InputBase, Avatar, Checkbox
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import API from '@/api';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import Image from 'next/image';

interface Todo {
    _id: string;
    task: string;
    quantity?: number;
    completed: boolean;
}

export default function ShopingListPage() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [taskName, setTaskName] = useState('');
    const [taskQty, setTaskQty] = useState('');
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const [editId, setEditId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editQty, setEditQty] = useState('');

    const router = useRouter();

    const colors = {
        screenBg: '#000000',
        cardTop: '#33363F',
        textPrimary: '#FFFFFF',
        textSecondary: '#C5C5C5',
        accent: '#FFD700',
    };

    useEffect(() => {
        setIsMounted(true);
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return router.push('/login');
            const res = await API.get(`/todos?userId=${userId}`);
            setTodos(res.data);
        } catch (err) {
            toast.error("Session expired.");
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskName.trim()) return;
        try {
            const userId = localStorage.getItem('userId');
            const res = await API.post('/todos', {
                task: taskName.trim(),
                quantity: parseInt(taskQty, 10) || 1, // Fixed: ensure it's a number
                userId: userId
            });
            setTodos([res.data, ...todos]);
            setTaskName('');
            setTaskQty('');
            toast.success("Added!");
        } catch (err) {
            toast.error("Failed to add.");
        }
    };

    const startEdit = (todo: Todo) => {
        setEditId(todo._id);
        setEditName(todo.task);
        setEditQty(String(todo.quantity || 1));
    };

    const handleUpdate = async (id: string) => {
        try {
            // UPDATED: Now sending both task and quantity
            const res = await API.put(`/todos/${id}`, {
                task: editName,
                quantity: parseInt(editQty, 10) || 1
            });
            setTodos(todos.map(t => t._id === id ? res.data : t));
            setEditId(null);
            toast.info("Updated!");
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const toggleComplete = async (todo: Todo) => {
        try {
            const res = await API.put(`/todos/${todo._id}`, {
                completed: !todo.completed
            });
            setTodos(todos.map(t => t._id === todo._id ? res.data : t));
        } catch (err) {
            toast.error("Toggle failed");
        }
    };

    const deleteTodo = async (id: string) => {
        try {
            await API.delete(`/todos/${id}`);
            setTodos(todos.filter(t => t._id !== id));
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    if (!isMounted) return <Box sx={{ minHeight: '100vh', bgcolor: '#000' }} />;

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: colors.screenBg,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            fontFamily: '"Poppins", sans-serif'
        }}>

            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                <Paper elevation={0} sx={{
                    width: '95%',
                    maxWidth: '420px',
                    borderRadius: '24px',
                    p: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                    background: `linear-gradient(180deg, rgba(51, 54, 63, 0.95) 0%, rgba(30, 32, 38, 0.9) 60%, rgba(30, 32, 38, 0.4) 100%), 
                                 linear-gradient(90deg, #FF4B2B 0%, #FFB75E 50%, #6A11CB 100%)`,
                    backgroundSize: 'cover',
                    backdropFilter: 'blur(10px)',
                }}>
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: '700', color: colors.textPrimary, fontSize: '38px', mb: 3 }}>
                            Shopping List
                        </Typography>
                        <IconButton onClick={handleLogout} sx={{ position: 'absolute', top: 15, right: 15, color: colors.accent, cursor: 'pointer' }}>
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <form onSubmit={handleAddTodo}>
                        <Box sx={{
                            display: 'flex', gap: '10px', mb: 4, alignItems: 'center',
                            '& .MuiInputBase-root': { backgroundColor: '#A0A0A0', borderRadius: '4px', color: '#333', px: 1.5, py: 0.5 }
                        }}>
                            <InputBase fullWidth placeholder="Title..." value={taskName} onChange={(e) => setTaskName(e.target.value)} sx={{ flex: 4 }} />
                            <InputBase placeholder="1" type="number" value={taskQty} onChange={(e) => setTaskQty(e.target.value)} sx={{ flex: 1.2 }} />
                            <Button type="submit" variant="outlined" sx={{
                                flex: 1.5, borderColor: colors.accent, color: colors.accent, textTransform: 'none',
                                fontWeight: '700', height: '35px', cursor: 'pointer',
                                '&:hover': { borderColor: colors.accent, bgcolor: 'rgba(255,215,0,0.1)' }
                            }}>Add</Button>
                        </Box>
                    </form>

                    <List sx={{
                        maxHeight: '400px', overflowY: 'auto', pr: 1,
                        '&::-webkit-scrollbar': { width: '4px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: colors.accent, borderRadius: '10px' }
                    }}>
                        {todos.map((todo) => (
                            <ListItem
                                key={todo._id}
                                secondaryAction={
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        {editId === todo._id ? (
                                            <IconButton onClick={() => handleUpdate(todo._id)} sx={{ color: '#4caf50', cursor: 'pointer' }}>
                                                <CheckIcon fontSize="small" />
                                            </IconButton>
                                        ) : (
                                            <IconButton onClick={() => startEdit(todo)} sx={{ color: colors.textSecondary, cursor: 'pointer' }}>
                                                <EditIcon fontSize="small" style={{ opacity: 0.6 }} />
                                            </IconButton>
                                        )}
                                        <IconButton onClick={() => deleteTodo(todo._id)} sx={{ color: colors.accent, cursor: 'pointer' }}>
                                            <CloseIcon sx={{ fontSize: '18px' }} />
                                        </IconButton>
                                    </Box>
                                }
                                disablePadding
                                sx={{ py: 1, mb: 1, borderBottom: `1px solid ${colors.accent}44` }}
                            >
                                {editId === todo._id ? (
                                    <>
                                        <InputBase
                                            type="number"
                                            value={editQty}
                                            onChange={(e) => setEditQty(e.target.value)}
                                            sx={{ width: '40px', color: colors.accent, fontWeight: '700', mr: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px', px: 0.5 }}
                                        />
                                        <InputBase
                                            fullWidth
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            sx={{ color: colors.textPrimary, fontWeight: '600' }}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Avatar sx={{ bgcolor: colors.accent, color: '#000', width: 28, height: 28, borderRadius: '4px', fontSize: '12px', fontWeight: '700', mr: 2 }}>
                                            {todo.quantity || '1'}
                                        </Avatar>
                                        <ListItemText
                                            primary={todo.task}
                                            sx={{
                                                '& .MuiListItemText-primary': {
                                                    color: colors.textPrimary,
                                                    fontWeight: '600',
                                                    fontSize: '15px',
                                                    textDecoration: todo.completed ? 'line-through' : 'none',
                                                    opacity: todo.completed ? 0.5 : 1
                                                }
                                            }}
                                        />
                                    </>
                                )}
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Box>

            <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <Box sx={{ width: '80%', height: '80%', position: 'relative' }}>
                    <Image src="/rightimageone.png" alt="Dashboard" fill priority style={{ objectFit: 'contain', opacity: 0.9 }} />
                </Box>
            </Box>

            <ToastContainer position="bottom-center" autoClose={2000} theme="dark" />
        </Box>
    );
}