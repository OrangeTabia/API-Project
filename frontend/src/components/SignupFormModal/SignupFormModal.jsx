import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';
import './SignupForm.css';

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  // useEffect(() => {
  //   const errors = {};
  //   if (!email) errors.email = "";
  //   if (username.length < 4) errors.username = "";
  //   if (!firstName) errors.firstName = "";
  //   if (!lastName) errors.lastName = "";
  //   if (password.length < 6) errors.password = "";
  //   if (!confirmPassword) errors.confirmPassword = "";
  //   setErrors(errors); 
  // }, [email, username, firstName, lastName, password, confirmPassword]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password
        })
      )
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data?.errors) {
            setErrors(data.errors);
          }
        });
    }
    return setErrors({
      confirmPassword: "Confirm Password field must be the same as the Password field"
    });
  };

  return (
      <form onSubmit={handleSubmit}>
        <div className="sign-up-form-div">
          <h1>Sign Up</h1>
          <label>
            Email
            <br></br>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <br></br>
          {errors.email && <p>{errors.email}</p>}
          <label>
            Username
            <br></br>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <br></br>
          {errors.username && <p>{errors.username}</p>}
          <label>
            First Name
            <br></br>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>
          <br></br>
          {errors && <p>{errors.firstName}</p>}
          <label>
            Last Name
            <br></br>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </label>
          <br></br>
          {errors && <p>{errors.lastName}</p>}
          <label>
            Password
            <br></br>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {errors && <p>{errors.password}</p>}
          <label>
            Confirm Password
            <br></br>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          <br></br>
          {errors && <p>{errors.confirmPassword}</p>}
          <button className="signup-button" type="submit" disabled={Object.values(errors).length > 0}>Sign Up</button>
        </div>
      </form>
  );
}

export default SignupFormModal;
