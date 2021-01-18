import React, { useState } from "react";
import Base from "../core/Base";
import { Link } from "react-router-dom";
import { signup } from "../auth/helper";
import FacebookLogin from "react-facebook-login";
import { API } from "../backend";
import { authenticate, signin, isAuthenticated } from "../auth/helper";
import { Redirect } from "react-router-dom";
// import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { GoogleLogin } from "react-google-login";

const Signup = () => {
	const [values, setValues] = useState({
		name: "",
		email: "",
		password: "",
		error: "",
		success: false,
		loading: false,
		didRedirect: false,
	});

	const {
		name,
		email,
		password,
		error,
		success,
		loading,
		didRedirect,
	} = values;
	const { user } = isAuthenticated();

	const handleChange = name => event => {
		setValues({ ...values, error: false, [name]: event.target.value });
	};

	const onSubmit = event => {
		event.preventDefault();
		setValues({ ...values, error: false });
		signup({ name, email, password })
			.then(data => {
				if (data.error) {
					setValues({ ...values, error: data.error, success: false });
				} else {
					setValues({
						...values,
						name: "",
						email: "",
						password: "",
						error: "",
						success: true,
					});
				}
				signin({ email, password })
					.then(data => {
						if (data.error == "Email and password do not match") {
							setValues({
								...values,
								error: "An account with that email already exists.",
								loading: false,
							});
						} else {
							authenticate(data, () => {
								setValues({
									...values,
									didRedirect: true,
								});
							});
						}
					})
					.catch(er => {
						console.log("Signin request failed");
					});
			})
			.catch(er => {
				console.log("Error in signup");
			});
	};

	const signupForm = () => {
		return (
			<div className="row">
				<div className="col-md-6 offset-sm-3 text-left">
					<form>
						<div className="form-group">
							<label className="text-light">Name</label>
							<input
								className="form-control"
								onChange={handleChange("name")}
								type="text"
								value={name}
							></input>
						</div>
						<div className="form-group">
							<label className="text-light">Email-Id</label>
							<input
								className="form-control"
								onChange={handleChange("email")}
								type="email"
								value={email}
							></input>
						</div>
						<div className="form-group">
							<label className="text-light">Password</label>
							<input
								className="form-control"
								onChange={handleChange("password")}
								type="password"
								value={password}
							></input>
						</div>
						<button onClick={onSubmit} className="btn btn-success btn-block">
							Submit
						</button>
						<div
							className="fb-login"
							style={{ textAlign: "center", margin: "20px auto" }}
						>
							<FacebookLogin
								appId="432706677778563"
								autoLoad={false}
								fields="name,email"
								onClick={componentClicked}
								callback={responseFacebook}
							/>
							{/* <FacebookLogin
								appId="432706677778563"
								autoLoad={false}
								callback={responseFacebook}
								render={renderProps => (
									<button onClick={renderProps.onClick}>
										This is my custom FB button
									</button>
								)}
							/> */}
							<GoogleLogin
								clientId="327673455287-3gd4knbeek3bsb86tkbcl29oagpppbg4.apps.googleusercontent.com"
								buttonText="Continue with Google"
								onSuccess={responseGoogle}
								onFailure={responseGoogle}
								cookiePolicy={"single_host_origin"}
							/>
						</div>
					</form>
				</div>
			</div>
		);
	};

	const responseGoogle = response => {
		const { name, email, googleId } = response.profileObj;
		fetch(`${API}/signup/google`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, email, googleId }),
		})
			.then(r => r.json())
			.then(data => {
				if (data.error) {
					setValues({ ...values, error: data.error, loading: false });
				} else {
					authenticate(data, () => {
						setValues({
							...values,
							didRedirect: true,
						});
					});
				}
			})
			.catch(er => {
				console.log("Signin request failed");
			});
	};

	const componentClicked = () => {
		setValues({ ...values, error: false, loading: true });
	};

	const responseFacebook = response => {
		const { name, email, userID } = response;
		fetch(`${API}/signup/facebook`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, email, userID }),
		})
			.then(r => r.json())
			.then(data => {
				if (data.error) {
					setValues({ ...values, error: data.error, loading: false });
				} else {
					authenticate(data, () => {
						setValues({
							...values,
							didRedirect: true,
						});
					});
				}
			})
			.catch(er => {
				console.log("Signin request failed");
			});
	};

	const loadingMessage = () => {
		return (
			loading && (
				<div className="alert alert-info">
					<h2>Loading...</h2>
				</div>
			)
		);
	};

	const performRedirect = () => {
		if (didRedirect) {
			if (user && user.role === 1) {
				return <Redirect to="/admin/dashboard" />;
			} else {
				return <Redirect to="/user/dashboard" />;
			}
		}

		if (isAuthenticated()) {
			return <Redirect to="/" />;
		}
	};

	const successMessage = () => {
		return (
			<div className="row">
				<div className="col-md-6 offset-sm-3 text-left">
					<div
						className="alert alert-success"
						style={{ display: success ? "" : "none" }}
					>
						New account was created successfully. Please
						<Link to="/signin">Login Here</Link>
					</div>
				</div>
			</div>
		);
	};

	const errorMessage = () => {
		return (
			<div className="row">
				<div className="col-md-6 offset-sm-3 text-left">
					<div
						className="alert alert-danger"
						style={{ display: error ? "" : "none" }}
					>
						{error}
					</div>
				</div>
			</div>
		);
	};

	return (
		<Base
			title="Signup Page"
			description="Signup now to be able to save games in your cart!"
		>
			{loadingMessage()}
			{successMessage()}
			{errorMessage()}
			{signupForm()}
			{performRedirect()}
		</Base>
	);
};

export default Signup;
