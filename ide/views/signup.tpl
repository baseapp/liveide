%def header():

%end

%def body():
	<div class="container">
		<h1>Sign up</h1>
		<form method="post" action="">
			<p>
				<input type="text" name="email" placeholder="Username (email)" required />
			</p>
			<p>
				<input type="password" name="password" placeholder="Password" required />
			</p>
			<p>
				<input type="submit" class="btn btn-primary" value="Submit" />
			</p>
		</form>
	</div>
%end

%include base header=header, body=body, static_url=static_url