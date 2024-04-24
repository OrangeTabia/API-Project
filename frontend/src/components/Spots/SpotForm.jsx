import { useNavigate } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux'; 
import { fetchAddImage, fetchCreateSpot, fetchEditSpot } from '../../store/spot';
import './SpotForm.css'; 

const SpotForm = ({ spot, formType}) => {
    const navigate = useNavigate(); 
    const dispatch = useDispatch();
    const [country, setCountry] = useState(spot?.country); 
    const [address, setAddress] = useState(spot?.address); 
    const [city, setCity] = useState(spot?.city); 
    const [state, setState] = useState(spot?.state);
    const [lat, setLat] = useState(1);
    const [lng, setLng] = useState(1); 
    const [description, setDescription] = useState(spot?.description);
    const [title, setTitle] = useState(spot?.title); 
    const [price, setPrice] = useState(spot?.price); 
    const [imageOne, setImageOne] = useState(null);
    const [imageTwo, setImageTwo] = useState(null);
    const [imageThree, setImageThree] = useState(null); 
    const [imageFour, setImageFour] = useState(null); 
    const [previewImage, setPreviewImage] = useState(null);
    const [errors, setErrors] = useState({}); 
    const [hasSubmitted, setHasSubmitted] = useState(false); 

    useEffect(() => {
        const errors = {}; 
        if (!country) errors.country = "Country is required";
        if (!address) errors.address = "Address is required";
        if (!city) errors.city = "City is required";
        if (!state) errors.state = "State is required";
        if (description.length < 30) errors.description = "Description needs a minimum of 30 chracters";
        if (!title) errors.title = "Name is required";
        if (!price) errors.price = "Price is required";
        if (!previewImage) errors.previewImage = "Preview image is required";

        if (previewImage != null && !(previewImage.includes(".png") ||  
            previewImage.includes(".jpg") ||
            previewImage.includes(".jpeg"))) {
                errors.previewImage = "Image URL must end in .png, .jpg. or .jpeg"
            }

        if (imageOne != null && !(imageOne.includes(".png") ||  
            imageOne.includes(".jpg") ||
            imageOne.includes(".jpeg"))) {
                errors.imageOne = "Image URL must end in .png, .jpg. or .jpeg"
            }
        if (imageTwo != null && !(imageTwo.includes(".png") ||  
            imageTwo.includes(".jpg") ||
            imageTwo.includes(".jpeg"))) {
                errors.imageTwo = "Image URL must end in .png, .jpg. or .jpeg"
            }
        if (imageThree != null && !(imageThree.includes(".png") ||  
            imageThree.includes(".jpg") ||
            imageThree.includes(".jpeg"))) {
                errors.imageThree = "Image URL must end in .png, .jpg. or .jpeg"
            }
        if (imageFour != null && !(imageFour.includes(".png") ||  
            imageFour.includes(".jpg") ||
            imageFour.includes(".jpeg"))) {
                errors.imageFour = "Image URL must end in .png, .jpg. or .jpeg"
            }

        setErrors(errors); 
    }, [
        country, 
        address,
        city, 
        state, 
        description, 
        title, 
        price, 
        previewImage,
        imageOne, 
        imageTwo,
        imageThree,
        imageFour
    ]); 

    const handleSubmit = async (e, errors) => {
        // Set the hasSubmitted variable to true to render errors
        e.preventDefault(); 
        setHasSubmitted(true); 

        // If there are errors, do a console log
        if (Object.values(errors).length > 0) {
            console.log('Stay on form, errors are present!')
        } else { 
            spot = {
                ...spot,
                country,
                address,
                city,
                state,
                description,
                name: title,
                price,
                lat,
                lng
            }
            // If we're creating the spot, POST a new spot then navigate
            // to the page that will display it
            if (formType === 'Create Spot') {
                // Create the spot
                const newSpot = await dispatch(fetchCreateSpot(spot));

                // Add the images to the new spot (only the ones that exist)
                let images = [
                    previewImage, 
                    imageOne,
                    imageTwo, 
                    imageThree,
                    imageFour
                ].filter((image) => image != null); 


                await Promise.all(images.map(async (image, index) => { 
                    let imageInfo = { 
                        url: image,
                        preview: index == 0
                    }
                    await dispatch(fetchAddImage(imageInfo, newSpot.id)); 
                }));

                // Navigate to the page
                navigate(`/spots/${newSpot.id}`); 
            }

            if (formType === 'Update Spot') {
                const updatedSpot = await dispatch(fetchEditSpot(spot, spot.id));
                navigate(`/spots/${updatedSpot.id}`); 
            }
        }
    }

    return (
        <form className="form" onSubmit={(e) => handleSubmit(e, errors)}>
            <h2>Create a new Spot</h2>
            <h3>Where&apos;s your place located?</h3>
            <p>Guests will only get your exact address once they booked a reservation</p>
            <label>
                Country <span className="errors">{hasSubmitted && errors.country}</span>
                <br></br>
                <input 
                    type="text" 
                    value={country}
                    placeholder="Country"
                    onChange={(e) => setCountry(e.target.value)}
                />
            </label>
            <br></br>
            <label>
                Street Address <span className="errors">{hasSubmitted && errors.address}</span>
                <br></br>
                <input 
                    type="text" 
                    value={address}
                    placeholder="Address"
                    onChange={(e) => setAddress(e.target.value)}
                />
            </label>
            <br></br>
            <label>
                City <span className="errors">{hasSubmitted && errors.city}</span>
                <br></br>
                <input 
                    type="text" 
                    value={city}
                    placeholder="City"
                    onChange={(e) => setCity(e.target.value)}
                />, 
            </label> 
            <br></br>
            <label>
                State <span className="errors">{hasSubmitted && errors.state}</span>
                <br></br>
                <input 
                    type="text" 
                    value={state}
                    placeholder="STATE"
                    onChange={(e) => setState(e.target.value)}
                />
            </label> 
            <br></br>
            <label>
                Latitude <span className="errors">{hasSubmitted && errors.lat}</span>
                <br></br>
                <input 
                    type="text" 
                    value={lat}
                    placeholder="latitude"
                    onChange={(e) => setLat(e.target.value)}
                />, 
            </label> 
            <br></br>
            <label>
                Longitude <span className="errors">{hasSubmitted && errors.lng}</span>
                <br></br>
                <input 
                    type="text" 
                    value={lng}
                    placeholder="longitude"
                    onChange={(e) => setLng(e.target.value)}
                />
            </label> 

            <hr></hr>

            <h3>Describe your place to guests</h3>
            <label>Mention the best features of your space, any special amentities like fast wifi or parking, and what you love about the neighborhood.
                <br></br>
                <textarea 
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </label>
            <div  className="errors">{hasSubmitted && errors.description}</div>

            <hr></hr>

            <h3>Create a title for your spot</h3>
            <label>
                Catch guests&apos; attention with a spot title that highlights what makes your place special.
                <br></br>
                <input 
                    type="text" 
                    value={title}
                    placeholder="Name of your spot"
                    onChange={(e) => setTitle(e.target.value)}
                />
            </label>
            <div  className="errors">{hasSubmitted && errors.title}</div>

            <hr></hr>

            <h3>Set a base price for your spot</h3>
            <label>
                Competitive pricing can help your listing stand out and rank higher in search results.
                <br></br>
                $ <input 
                    type="text" 
                    value={price}
                    placeholder="Price per night (USD)"
                    onChange={(e) => setPrice(e.target.value)}
                 />
            </label>
            <div  className="errors">{hasSubmitted && errors.title}</div>

            <hr></hr>

            <h3>Liven up your spot with photos</h3>
            <label>
                Submit a link to at least one photo to publish your spot.
                <br></br>
                <input 
                    type="text" 
                    value={previewImage}
                    placeholder="Preview Image URL"
                    onChange={(e) => setPreviewImage(e.target.value)}
                />
                <div  className="errors">{hasSubmitted && errors.previewImage}</div>

                <input type="text" placeholder="Image URL" onChange={(e) => setImageOne(e.target.value)}/>
                <div  className="errors">{hasSubmitted && errors.imageOne}</div>
                <input type="text" placeholder="Image URL" onChange={(e) => setImageTwo(e.target.value)}/>
                <div  className="errors">{hasSubmitted && errors.imageTwo}</div>
                <input type="text" placeholder="Image URL" onChange={(e) => setImageThree(e.target.value)}/>
                <div  className="errors">{hasSubmitted && errors.imageThree}</div>
                <input type="text" placeholder="Image URL" onChange={(e) => setImageFour(e.target.value)}/>
                <div  className="errors">{hasSubmitted && errors.imageFour}</div>
            </label>

            <hr></hr>

            <button className="create-button" type="submit">{formType}
            </button>
        </form>
    )
}

export default SpotForm;