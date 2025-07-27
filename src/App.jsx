import { Button, HStack } from "@chakra-ui/react"
import './App.css'
import { createContext, useEffect, useMemo, useReducer } from "react"
import Planner from "./components/Planner";
import { taskReducer } from "./reducers/taskReducer";

function App() {

  const theme = useMemo(() => ({ isDark: false, primaryColor: 'blue' }), []);
  const [tasks, dispatch] = useReducer(taskReducer, []);

  useEffect(() => {
    const savedTasks = localStorage.getItem('kanban-tasks');
    if (savedTasks) {
      try {
        dispatch({ type: 'SET_TASKS', payload: JSON.parse(savedTasks) });
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
  }, [tasks]);

  return (


          <Planner />
       
  );
}

export default App;
