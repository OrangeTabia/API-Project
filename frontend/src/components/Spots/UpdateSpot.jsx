import SpotForm from './SpotForm'; 
import { useSelector } from 'react-redux';

const UpdateSpot = () => {
    const currentUser = useSelector(state => state.session?.user);
    
    if (currentUser) {
        const spot = {
            country: '',
            address: '',
            city: '',
            state: '',
            description: '',
            title: '',
            price: '',
            lat: '',
            lng: '',
            previewImage: '',
            imageOne: '', 
            imageTwo: '',
            imageThree: '',
            imageFour: ''
        }
    
        return (
            <SpotForm 
            spot={spot}
            formType={"Update Spot"}
            />
        )
    }
}

export default UpdateSpot;