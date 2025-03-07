import React, { useState, useEffect } from 'react';
import { PlusCircle, CheckCircle2, Circle, Timer, ClipboardList, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

type TaskStatus = 'not-started' | 'ongoing' | 'completed';

interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const now = new Date().toISOString();
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          title: newTaskTitle.trim(),
          status: 'not-started',
          createdAt: now,
          updatedAt: now
        }
      ]);
      setNewTaskTitle('');
    }
  };

  const updateTaskStatus = (taskId: number, newStatus: TaskStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } 
        : task
    ));
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.text('Task Report', pageWidth / 2, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 20, 30);
    
    // Tasks
    doc.setFontSize(14);
    let yPos = 50;
    
    const statusEmoji = {
      'not-started': '⭕',
      'ongoing': '⏳',
      'completed': '✅'
    };
    
    tasks.forEach((task, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      const statusText = task.status.replace('-', ' ').toUpperCase();
      doc.text(`${statusEmoji[task.status]} ${task.title}`, 20, yPos);
      doc.setFontSize(10);
      doc.text(`Status: ${statusText}`, 25, yPos + 5);
      doc.text(`Created: ${format(new Date(task.createdAt), 'PP')}`, 25, yPos + 10);
      doc.text(`Last Updated: ${format(new Date(task.updatedAt), 'PP')}`, 25, yPos + 15);
      doc.setFontSize(14);
      yPos += 25;
    });
    
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, 290, { align: 'center' });
      doc.text('Generated by Gurama Task Tracking', pageWidth / 2, 285, { align: 'center' });
    }
    
    doc.save('task-report.pdf');
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'not-started':
        return <Circle className="w-5 h-5 text-gray-400" />;
      case 'ongoing':
        return <Timer className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  const getTaskStatusClass = (status: TaskStatus) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-50';
      case 'ongoing':
        return 'bg-blue-50 border-blue-100';
      case 'completed':
        return 'bg-green-50 border-green-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 sm:py-12 relative">
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gurama Task Tracking</h1>
            </div>
            
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              title="Download PDF Report"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Download Report</span>
            </button>
          </div>
          
          <form onSubmit={addTask} className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1 rounded-xl border border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 text-gray-700 placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm whitespace-nowrap"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add Task</span>
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${getTaskStatusClass(task.status)}`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(task.status)}
                  <div className="flex flex-col">
                    <span className="text-gray-800 font-medium">{task.title}</span>
                    <span className="text-xs text-gray-500">
                      Created: {format(new Date(task.createdAt), 'PP')}
                    </span>
                  </div>
                </div>
                
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                  className="rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-3 pr-10 text-sm w-full sm:w-auto"
                >
                  <option value="not-started">Not Started</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No tasks yet. Add your first task above!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <footer className="absolute bottom-0 left-0 right-0 text-center py-4 text-gray-600">
        Built by <span className="font-medium text-indigo-600">Kyendy Mauwi</span>
      </footer>
    </div>
  );
}

export default App;