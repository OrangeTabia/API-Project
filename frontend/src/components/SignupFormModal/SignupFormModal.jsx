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
  const [hasSubmitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (hasSubmitted) {
      // Ensure the passwords match
      if (password !== confirmPassword) {
        errors.confirmPassword = "Confirm Password field must be the same as the Password field"
      } else { 
        delete errors.confirmPassword
      }

      // Ensure the password length is acceptable
      if (password.length < 6) { 
        errors.password = "Password must be 6 characters or more"
      } else { 
        delete errors.password
      }

      // Ensure that the username has a proper length
     if (username.length < 4) { 
       errors.nameLength = "Username must be at least 4 characters"
     } else { 
        delete errors.nameLength
     }
    }
    setErrors({...errors});
  }, [
    password, 
    confirmPassword, 
    username,
    hasSubmitted,
  ])


  const handleSubmit = (e) => {
    e.preventDefault();
    // See if there are any errors associated with the username + backend
    setSubmitted(true);

    // Prevent there from being a dispatch when there are bad FE values
    if ((password.length < 6) || username.length < 4 || password !== confirmPassword) return;

    // Otherwise, try and create it
    dispatch(
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
          setErrors({
            ...data.errors,
          });
        }
      });
  };

  return (
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="sign-up-form-div">
          <h1>Sign Up</h1>
          {
            // If there are errors, map through all of the errors and render them all
            errors && (
              <div className="signup-errors">
                {
                  Object.values(errors).map((errorMessage) => (
                    <li key={errorMessage.id}>{errorMessage}</li>
                  ))
                }
              </div>
            )
          }
          
          <br></br>
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
          <button 
          className="signup-button" 
          type="submit" 
          disabled={
            // If there are errors on the FE keys
            errors.confirmPassword || errors.password || errors.nameLength ||
            // OR if there are any empty values for the state ("")
            [email, username, firstName, lastName, password, confirmPassword].includes("")
          }
          >Sign Up</button>
        </div>
      </form>
  );

}

export default SignupFormModal;
