import { useModal } from '../../context/Modal'; 
import { fetchDeleteSpot, fetchLoadCurrentUserSpots } from '../../store/spot';
import { useDispatch } from 'react-redux';

const DeleteSpot = ({spotId}) => {
    const { closeModal } = useModal(); 
    const dispatch = useDispatch();  

    debugger;

    const handleDelete = async (e) => {
        e.preventDefault();
        await dispatch(fetchDeleteSpot(spotId)); 
        await dispatch(fetchLoadCurrentUserSpots());
        await closeModal(); 
    }

    return (
        <div>
            <h1>Confirm Delete</h1>
            <p>Are you sure you want to remove this spot from the listings?</p>
            <button type="submit" onClick={handleDelete}>Yes (Delete Spot)</button>
            <button type="submit" onClick={() => closeModal()}>No (Keep Spot)</button>
        </div>
    )
}

export default DeleteSpot;