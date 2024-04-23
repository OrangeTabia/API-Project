import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton-bonus';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  // how to only show "Create a New Spot" if a user is logged in? 
  // If user == null only return home and profile button
  // if user exists, show home profile and create new spot button 

  return (
    <ul>
      <li>
        <NavLink to="/">Home</NavLink>
      </li>
      {isLoaded && (
        <li>
          <ProfileButton user={sessionUser} />
        </li>
      )}
      {sessionUser && (
        <li>
          <NavLink to="/spots">Create a New Spot</NavLink>
        </li>
      )}
    </ul>
  );
}

export default Navigation;
