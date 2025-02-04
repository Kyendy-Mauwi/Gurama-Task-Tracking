import React, { useState } from 'react';
import {
  Frame,
  Page,
  ScrollView,
  StackLayout,
  TextField,
  Button,
  Label,
  FlexboxLayout,
  ListPicker
} from '@nativescript/core/ui';

type TaskStatus = 'not-started' | 'ongoing' | 'completed';

interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

const statusOptions = ['not-started', 'ongoing', 'completed'];
const statusLabels = ['Not Started', 'Ongoing', 'Completed'];

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = () => {
    if (newTaskTitle.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          title: newTaskTitle.trim(),
          status: 'not-started'
        }
      ]);
      setNewTaskTitle('');
    }
  };

  const updateTaskStatus = (taskId: number, statusIndex: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: statusOptions[statusIndex] as TaskStatus } : task
    ));
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'not-started':
        return '#9CA3AF';
      case 'ongoing':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
    }
  };

  return (
    <Frame>
      <Page>
        <ScrollView>
          <StackLayout padding={16}>
            {/* Header */}
            <Label
              text="Gurama Task Tracking"
              fontSize={24}
              fontWeight="bold"
              marginBottom={16}
            />

            {/* Add Task Form */}
            <FlexboxLayout flexDirection="row" marginBottom={16}>
              <TextField
                hint="What needs to be done?"
                text={newTaskTitle}
                onTextChange={(args) => setNewTaskTitle(args.value)}
                flexGrow={1}
                marginRight={8}
              />
              <Button
                text="Add Task"
                onTap={addTask}
                backgroundColor="#4F46E5"
                color="white"
                padding={{ left: 16, right: 16 }}
              />
            </FlexboxLayout>

            {/* Task List */}
            <StackLayout>
              {tasks.map(task => (
                <StackLayout
                  key={task.id}
                  backgroundColor="white"
                  padding={16}
                  marginBottom={8}
                  borderRadius={8}
                >
                  <Label
                    text={task.title}
                    fontSize={16}
                    fontWeight="500"
                    marginBottom={8}
                  />
                  <ListPicker
                    items={statusLabels}
                    selectedIndex={statusOptions.indexOf(task.status)}
                    onSelectedIndexChange={(args) => 
                      updateTaskStatus(task.id, args.value)
                    }
                    color={getStatusColor(task.status)}
                  />
                </StackLayout>
              ))}

              {tasks.length === 0 && (
                <Label
                  text="No tasks yet. Add your first task above!"
                  textAlignment="center"
                  color="#6B7280"
                  marginTop={32}
                />
              )}
            </StackLayout>

            {/* Footer */}
            <Label
              text="Built by Kyendy Mauwi"
              textAlignment="center"
              color="#6B7280"
              marginTop={32}
            />
          </StackLayout>
        </ScrollView>
      </Page>
    </Frame>
  );
}

export default App;