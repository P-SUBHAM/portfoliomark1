from flask import Flask, render_template, request, redirect, url_for, jsonify
from models import db, Todo
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///todos.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

@app.route('/')
def index():
    todos = Todo.query.all()
    return render_template('index.html', todos=todos)

@app.route('/add', methods=['POST'])
def add():
    new_todo = Todo(content=request.form['content'])
    db.session.add(new_todo)
    db.session.commit()
    return redirect(url_for('index'))

@app.route('/delete/<int:todo_id>')
def delete(todo_id):
    todo = Todo.query.get(todo_id)
    db.session.delete(todo)
    db.session.commit()
    return redirect(url_for('index'))

@app.route('/update/<int:todo_id>', methods=['POST'])
def update(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    content = request.form.get('content')
    if content:
        todo.content = content
        db.session.commit()
        return jsonify({'status': 'success'})
    return jsonify({'status': 'error'}), 400

@app.route('/toggle/<int:todo_id>', methods=['POST'])
def toggle(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    completed = request.form.get('completed') == 'true'
    todo.completed = completed
    db.session.commit()
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)
