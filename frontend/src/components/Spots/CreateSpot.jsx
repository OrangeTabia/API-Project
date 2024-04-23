import SpotForm from './SpotForm'; 
import { useSelector } from 'react-redux';

const CreateSpot = () => {
    const currentUser = useSelector(state => state.session?.user); 

    if (currentUser) {
        const spot = {
            country: '',
            address: '',
            city: '',
            state: '',
            description: '',
            name: '',
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
            formType={"Create Spot"}
            />
        )
    }
}

export default CreateSpot;