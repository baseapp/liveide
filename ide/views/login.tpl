%def header():

%end

%def body():
	<div class="container">
		<h1>Login</h1>

		%if msg:
			<div class="alert">{{msg}}</div>
		%end


		<form method="post" action="">
			<p>
				<input type="text" name="email" placeholder="Username (email)" />
			</p>
			<p>
				<input type="password" name="password" placeholder="Password" />
			</p>
			<p>
				<input type="submit" class="btn btn-primary" value="Login" />
				%if signup_enabled:
					or
					<a href="/signup/">Sign up</a>
				%end
			</p>
		</form>

		%if debug:
			<h2>Debug: users</h2>
			%for item in users:
				<p>id: {{item.id}} / email: {{item.email}} / password: {{item.password}}</p>
			%end
		%end
	</div>
%end

%include base header=header, body=body, static_url=static_url