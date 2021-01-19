import React, { useState, useEffect } from "react";
import Base from "../core/Base";
import { signin, isAuthenticated } from "../auth/helper";
import { Redirect } from "react-router-dom";
import { API } from "../backend";

const ResetPassword = () => {
	const [loading, setLoading] = useState(true);
	const [current, setCurrent] = useState("");
	const [newP, setNew] = useState("");
	const [newP2, setNew2] = useState("");
	const [error, setError] = useState("");
	const [redirect, setRedirect] = useState(false);
	const [status, setStatus] = useState("");

	useEffect(() => {
		fetch(`${API}/getStatus/${isAuthenticated().user._id}`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${isAuthenticated().token}`,
			},
		})
			.then(R => R.json())
			.then(stat => {
				setStatus(stat);
				setLoading(false);
			})
			.catch(console.log);
	});

	const performRedirect = () => {
		if (redirect) return <Redirect to="/" />;
	};

	const linked = () => {
		if (newP !== newP2) {
			setError("Passwords must be the same!");
			return;
		}
		fetch(`${API}/update/${isAuthenticated().user._id}`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${isAuthenticated().token}`,
			},
			body: JSON.stringify({ password: newP }),
		})
			.then(R => R.json())
			.then(() => setRedirect(true))
			.catch(console.log);
	};

	const nonlinked = user => {
		signin(user).then(data => {
			if (data.error) {
				setError("Incorrect password. Try again");
				return;
			} else {
				if (newP !== newP2) {
					setError("Passwords must be the same!");
					return;
				}
				fetch(`${API}/update/${isAuthenticated().user._id}`, {
					method: "POST",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
						Authorization: `Bearer ${isAuthenticated().token}`,
					},
					body: JSON.stringify({ password: newP }),
				})
					.then(R => R.json())
					.then(() => setRedirect(true))
					.catch(console.log);
			}
		});
	};

	const onSubmit = ev => {
		ev.preventDefault();
		if (status === "linked") linked();
		else {
			const user = { email: isAuthenticated().user.email, password: current };
			nonlinked(user);
		}
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

	return loading ? (
		<img
			style={{ width: "200px" }}
			src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Youtube_loading_symbol_1_(wobbly).gif"
			alt="loading"
		/>
	) : (
		<Base title="Reset Password" description="">
			<div className="row">
				<div className="col-md-6 offset-sm-3 text-left">
					{errorMessage()}
					<form>
						{status === "not linked" && (
							<div className="form-group">
								<label className="text-light">Current password</label>
								<input
									onChange={ev => {
										setCurrent(ev.target.value);
									}}
									className="form-control"
									type="password"
								/>
							</div>
						)}
						<div className="form-group">
							<label className="text-light">New password</label>
							<input
								onChange={ev => {
									setNew(ev.target.value);
								}}
								className="form-control"
								type="password"
							/>
						</div>
						<div className="form-group">
							<label className="text-light">New password (again)</label>
							<input
								onChange={ev => {
									setNew2(ev.target.value);
								}}
								className="form-control"
								type="password"
							/>
						</div>
						<button onClick={onSubmit} className="btn btn-success btn-block">
							Submit
						</button>
					</form>
				</div>
			</div>
			{performRedirect()}
		</Base>
	);
};

export default ResetPassword;
