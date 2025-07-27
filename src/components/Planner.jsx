import useOnlineStatus from '@/hooks/useOnlineStatus';
import React, { useState, useEffect, useReducer, useCallback, useMemo, useRef, useContext, createContext, useImperativeHandle, forwardRef, useLayoutEffect, useTransition, useDeferredValue, useId } from 'react';
import AlertDialog from './AlertDialog';
import Toast from './Toast';
import { Badge, Button, Card, CloseButton, Container, Dialog, Field, Heading, Input, Menu, Portal, Progress, Separator, Textarea } from '@chakra-ui/react';
import { taskReducer } from '@/reducers/taskReducer';
import { InfoTip } from "@/components/ui/toggle-tip"

export default function Planner() {

    const [developers] = useState(['Vaibhav B', 'Viraj']);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [isPending, startTransition] = useTransition();

    const deferredSearchTerm = useDeferredValue(searchTerm);
    const isOnline = useOnlineStatus();
    const [tasks, dispatch] = useReducer(taskReducer, []);

    const [taskToDelete, setTaskToDelete] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        priority: 'medium',
        assignee: '',
        targetDate: '',
        status: 'development'
    });


    useEffect(() => {
        const savedTasks = localStorage.getItem('kanban-tasks');
        if (savedTasks) {
            try {
                const parsedTasks = JSON.parse(savedTasks);
                parsedTasks.forEach(task => dispatch({ type: 'ADD_TASK', payload: task }));
            } catch (error) {
                console.error('Error loading tasks:', error);
            }
        }
    }, []);

    // useEffect to save tasks
    useEffect(() => {
        if (tasks.length > 0) {
            localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
        }
    }, [tasks]);

    // Toast helper function
    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type });
    }, []);

    // useCallback for memoized functions
    const handleAddTask = useCallback(() => {
        if (!formData.title.trim()) {
            showToast('Task title is required', 'error');
            return;
        }

        startTransition(() => {
            dispatch({ type: 'ADD_TASK', payload: formData });
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                assignee: '',
                targetDate: '',
                status: 'development'
            });
            // setIsModalOpen(false);
            showToast('Task added successfully', 'success');
        });
    }, [formData, showToast]);

    const handleDeleteTask = useCallback((taskId) => {
        setTaskToDelete(taskId);
        setIsDeleteDialogOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (taskToDelete) {
            dispatch({ type: 'DELETE_TASK', payload: taskToDelete });
            showToast('Task deleted successfully', 'info');
        }
        setTaskToDelete(null);
        setIsDeleteDialogOpen(false);
    }, [taskToDelete, showToast]);

    const handleMoveTask = useCallback((taskId, newStatus) => {
        dispatch({ type: 'MOVE_TASK', payload: { id: taskId, status: newStatus } });
        showToast(`Task moved to ${newStatus}`, 'info');
    }, [showToast]);

    // useMemo for expensive calculations
    const filteredTasks = useMemo(() => {
        return tasks.filter(task =>
            task.title.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
            task.assignee.toLowerCase().includes(deferredSearchTerm.toLowerCase())
        );
    }, [tasks, deferredSearchTerm]);

    const tasksByStatus = useMemo(() => {
        const grouped = {
            development: [],
            testing: [],
            deployed: []
        };

        filteredTasks.forEach(task => {
            if (grouped[task.status]) {
                grouped[task.status].push(task);
            }
        });

        return grouped;
    }, [filteredTasks]);

    const taskStats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(task => task.status === 'deployed').length;
        return { total, completed, progress: total > 0 ? (completed / total) * 100 : 0 };
    }, [tasks]);

    const getPriorityColor = useCallback((priority) => {
        const colors = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'No date set';
        return new Date(dateString).toLocaleDateString();
    }, []);

    const getStatusLabel = (status) => {
        const labels = {
            development: 'In Development',
            testing: 'In Testing',
            deployed: 'Deployed'
        };
        return labels[status] || status;
    };

    return (

        <Container className="bg-blue-50 p-8 mt-4" >

            <div className="min-h-screen p-8 mt-4">
                {/* Toast Notification */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {/* Header */}
                <div className="p-8">
                    <div className="flex justify-around items-center m-6">
                        <Heading>Project Planner</Heading>
                        <div className="flex items-center">

                            {isOnline ? <Badge size="lg" colorPalette="green">🟢 Online</Badge> : <Badge size="lg" colorPalette="red">🔴 Offline</Badge>}
                            <Dialog.Root size="lg" placement="center" motionPreset="slide-in-bottom" closeOnInteractOutside={false} modal={false}>
                                <Dialog.Trigger asChild>
                                    <Button colorPalette="blue" variant="solid" size="md">
                                        New Task
                                    </Button>
                                </Dialog.Trigger>
                                <Portal>
                                    <Dialog.Positioner pointerEvents="none">
                                        <Dialog.Content>
                                            <Dialog.Header>
                                                <Dialog.Title>Create New Task</Dialog.Title>
                                            </Dialog.Header>
                                            <Dialog.Body>
                                                <div className="space-y-4">
                                                    <Field.Root required>
                                                        <Field.Label>
                                                            Task Name
                                                            <Field.RequiredIndicator />
                                                        </Field.Label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter task title"
                                                            value={formData.title}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </Field.Root>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Description
                                                        </label>
                                                        <Textarea
                                                            placeholder="Enter task description"
                                                            value={formData.description}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            rows="3"
                                                        />
                                                    </div>


                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Priority
                                                            </label>
                                                            <select
                                                                value={formData.priority}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                <option value="low">Low</option>
                                                                <option value="medium">Medium</option>
                                                                <option value="high">High</option>
                                                            </select>
                                                        </div> *

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Status
                                                            </label>
                                                            <select
                                                                value={formData.status}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                <option value="development">In Development</option>
                                                                <option value="testing">In Testing</option>
                                                                <option value="deployed">Deployed</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Assign Developer
                                                        </label>
                                                        <select
                                                            value={formData.assignee}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="">Select developer</option>
                                                            {developers.map(dev => (
                                                                <option key={dev} value={dev}>{dev}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Target Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={formData.targetDate}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </Dialog.Body>
                                            <Dialog.Footer>
                                                <Dialog.ActionTrigger asChild>
                                                    <Button variant="outline">Cancel</Button>
                                                </Dialog.ActionTrigger>
                                                <Button onClick={handleAddTask}>Save</Button>
                                            </Dialog.Footer>
                                            <Dialog.CloseTrigger asChild>
                                                <CloseButton size="sm" />
                                            </Dialog.CloseTrigger>
                                        </Dialog.Content>
                                    </Dialog.Positioner>
                                </Portal>
                            </Dialog.Root>


                        </div>
                    </div>
                    <Separator />
                    {/* Progress and Search */}

                    <Progress.Root maxW="240px">
                        <Progress.Label mb="2">
                            Spring Progress
                            <InfoTip>{taskStats.completed}/{taskStats.total} tasks completed</InfoTip>
                        </Progress.Label>
                        <Progress.Track>
                            <Progress.Range colorPalette='blue' />
                        </Progress.Track>
                    </Progress.Root>

                    <Separator />

                    {/* 
                    <div className="flex justify-start items-center mb-2">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Progress:
                            </span>
                            <div className="w-48 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${taskStats.progress}%` }}
                                ></div>
                            </div>
                        </div>
 */}

                    {/* 
                    </div> */}


                </div>


                <Card.Root>
                    <Card.Body gap="2">

                        <Card.Title mb="2">Search Task</Card.Title>
                        <Card.Description>
                            Search using developer name, task and priority
                        </Card.Description>
                        <Field.Root>

                            <Field.RequiredIndicator />
                            <Input colorPalette="white" placeholder="Search by Task, Developer..."
                                onChange={(e) => setSearchTerm(e.target.value)} />


                        </Field.Root>
                    </Card.Body>
                </Card.Root>

                <Separator />


                {
                    isPending && (
                        <div className="text-center mb-4">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <p className="text-gray-600 mt-2">Updating tasks...</p>
                        </div>
                    )
                }
                <Container>
                    {/* Kanban Columns */}
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

                        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                            <div key={status} className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex justify-around items-center mb-4">
                                    <Heading size="md"> {getStatusLabel(status)}</Heading>



                                    <Badge variant="solid" colorPalette="blue">
                                        {statusTasks.length}
                                    </Badge>
                                    {/* <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                                        
                                    </span> */}
                                </div>
                                <hr className="mb-4" />

                                <div className="space-y-3">

                                    {statusTasks.map((task) => (

                                        <Card.Root key={task.id}>
                                            <Card.Body gap="2">

                                                <Card.Title mb="2">{task.title}</Card.Title>

                                                {/* 
                                                <div  className="task-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-semibold text-gray-800"></h3> */}

                                                {/* </div> */}

                                                <p className="text-sm text-gray-600 mb-3">{task.description}</p>

                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                        {task.priority} priority
                                                    </span>
                                                    {task.assignee && (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                            {task.assignee}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-gray-500">
                                                    Due: {formatDate(task.targetDate)}
                                                </p>
                                                {/* </div> */}
                                            </Card.Body>

                                            <Card.Footer>
                                                <Menu.Root>
                                                    <Menu.Trigger asChild>
                                                        <Button colorPalette="blue" variant="outline" size="md">
                                                            Manage Task
                                                        </Button>
                                                    </Menu.Trigger>
                                                    <Portal>
                                                        <Menu.Positioner>
                                                            <Menu.Content>
                                                                {status !== 'development' && (
                                                                    <Menu.Item onClick={() => handleMoveTask(task.id, 'development')}>Move To Development</Menu.Item>
                                                                )}

                                                                {status !== 'testing' && (
                                                                    <Menu.Item onClick={() => handleMoveTask(task.id, 'testing')}> Move to Testing</Menu.Item>
                                                                )}

                                                                {status !== 'deployed' && (
                                                                    <Menu.Item onClick={() => handleMoveTask(task.id, 'deployed')}> Move to Deployment</Menu.Item>
                                                                )}
                                                                <Menu.Item onClick={() => handleDeleteTask(task.id)}> Delete Task</Menu.Item>
                                                            </Menu.Content>
                                                        </Menu.Positioner>
                                                    </Portal>
                                                </Menu.Root>
                                            </Card.Footer>

                                        </Card.Root>
                                    ))}
                                </div>
                            </div>



                        ))
                        }
                    </div >

                </Container>
                {/* Delete Confirmation Dialog */}
                < AlertDialog
                    colorPalette="red"
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Task"
                    message="Are you sure you want to delete this task? This action cannot be undone."
                />




            </div >

        </Container>
    );
}