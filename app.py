from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def handle_login():
    username = request.form['username']
    password = request.form['password']
    # Assuming hardcoded login credentials for simplicity
    if username == 'admin12' and password == 'admin12':
        return redirect(url_for('management'))  # Redirects to management page after successful login
    else:
        return render_template('login.html', error='Incorrect username or password')

@app.route('/management')
def management():
    return render_template('index.html')

@app.route('/schedule')
def schedule():
    return render_template('schedule.html')

if __name__ == '__main__':
    app.run(debug=True)
