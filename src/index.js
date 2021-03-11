const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if (!user)
    response.status(400).send({ error: 'Username not found!' });

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const hasUser = users.some(user => user.username === username);

  if (hasUser)
    return response.status(400).send({ error: 'User already exists!' });

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  let todoToBeUpdated = user.todos.find(todo => todo.id === id);

  if (!todoToBeUpdated)
    return response.status(404).send({ error: 'ToDo not found' });

  todoToBeUpdated.title = title;
  todoToBeUpdated.deadline = deadline;

  return response.status(201).json(todoToBeUpdated);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let todoToBeUpdated = user.todos.find(todo => todo.id === id);

  if (!todoToBeUpdated)
    return response.status(404).send({ error: 'ToDo not found' });

  todoToBeUpdated.done = true;

  return response.status(201).json(todoToBeUpdated);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let todoToBeDeleted = user.todos.find(todo => todo.id === id);

  if (!todoToBeDeleted)
    return response.status(404).send({ error: 'ToDo not found' });

  user.todos.splice(user.todos.indexOf(todoToBeDeleted), 1);

  return response.status(204).send();
});

module.exports = app;