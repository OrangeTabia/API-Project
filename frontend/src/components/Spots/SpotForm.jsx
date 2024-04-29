import { useNavigate } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux'; 
import { fetchAddImage, fetchCreateSpot, fetchDeleteImage, fetchEditSpot } from '../../store/spot';
import './SpotForm.css'; 

const SpotForm = ({ spot, formName, formType}) => {
    const navigate = useNavigate(); 
    const dispatch = useDispatch();
    const [country, setCountry] = useState(spot?.country); 
    const [address, setAddress] = useState(spot?.address); 
    const [city, setCity] = useState(spot?.city); 
    const [state, setState] = useState(spot?.state);
    const [lat, setLat] = useState(1);
    const [lng, setLng] = useState(1); 
    const [description, setDescription] = useState(spot?.description);
    const [name, setName] = useState(spot?.name); 
    const [price, setPrice] = useState(spot?.price); 
    // These are the non preview images
    const nonPreviewImages = spot?.SpotImages?.filter((image) => !image.preview);
    const [imageOne, setImageOne] = useState(nonPreviewImages ? nonPreviewImages[0]?.url : '');
    const [imageTwo, setImageTwo] = useState(nonPreviewImages ? nonPreviewImages[1]?.url : '');
    const [imageThree, setImageThree] = useState(nonPreviewImages ? nonPreviewImages[2]?.url : ''); 
    const [imageFour, setImageFour] = useState(nonPreviewImages ? nonPreviewImages[3]?.url : ''); 
    // Call this the preview Image
    const [previewImage, setPreviewImage] = useState(spot?.SpotImages?.find((image) => image.preview)?.url);
    const [errors, setErrors] = useState({}); 
    const [hasSubmitted, setHasSubmitted] = useState(false); 

    useEffect(() => {
        const errors = {}; 
        if (!country) errors.country = "Country is required";
        if (!address) errors.address = "Address is required";
        if (!city) errors.city = "City is required";
        if (!state) errors.state = "State is required";
        if (description.length < 30) errors.description = "Description needs a minimum of 30 chracters";
        if (!name) errors.name = "Name is required";
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
        name,
        price, 
        previewImage,
        imageOne, 
        imageTwo,
        imageThree,
        imageFour
    ]); 

    const handleSubmit = async (e, errors) => {
        e.preventDefault(); 
        // Set the hasSubmitted variable to true to render errors
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
                name,
                price,
                lat,
                lng
            }

            // If we're creating the spot, POST a new spot then navigate
            // to the page that will display it
            // POST NEW SPOT
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

                // Navigate to the page after posting a new spot
                navigate(`/spots/${newSpot.id}`); 
            }


            // UPDATE SPOT
            if (formType === 'Update Spot') {
                const updatedSpot = await dispatch(fetchEditSpot(spot, spot.id)); 

                let images = [
                    previewImage, 
                    imageOne,
                    imageTwo, 
                    imageThree,
                    imageFour
                ].filter((image) => image != null); 

                // Load all of the images associated with the spot 
                const currentImages = spot.SpotImages;
                
                // Delete every single one with dispatches
                await Promise.all(currentImages.map(async (image) => { 
                    await dispatch(fetchDeleteImage(image.id)); 
                }));

                // Make new ones
                await Promise.all(images.map(async (image, index) => { 
                    let imageInfo = { 
                        url: image,
                        preview: index == 0
                    }
                    await dispatch(fetchAddImage(imageInfo, updatedSpot.id)); 
                }));

                navigate(`/spots/${updatedSpot.id}`); 
            }
        }
    }

    return (
        <form className="form" onSubmit={(e) => handleSubmit(e, errors)}>
            <div className="form-size">
                <h1>{formName}</h1>
                <h3>Where&apos;s your place located?</h3>
                <p className="location-description">Guests will only get your exact address once they booked a reservation.</p>
                <label>
                    Country <span className="errors">{hasSubmitted && errors.country}</span>
                    <br></br>
                    <input 
                        className="regular-input"
                        type="text" 
                        value={country}
                        placeholder="Country"
                        onChange={(e) => setCountry(e.target.value)}
                    />
                </label>
                <br></br>
                <br></br>
                <label>
                    Street Address <span className="errors">{hasSubmitted && errors.address}</span>
                    <br></br>
                    <input 
                        className="regular-input"
                        type="text" 
                        value={address}
                        placeholder="Address"
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </label>
                <br></br>
                <br></br>

                <div className="city-state">
                    <label className="city">
                    City <span className="errors">{hasSubmitted && errors.city}</span>
                    <br></br>
                        <input 
                            className="city-input"
                            type="text" 
                            value={city}
                            placeholder="City"
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </label> 
                    <p className="city-comma">,</p>
                    <label className="state">
                        State <span className="errors">{hasSubmitted && errors.state}</span>
                        <br></br>
                        <input 
                            className="state-input"
                            type="text" 
                            value={state}
                            placeholder="STATE"
                            onChange={(e) => setState(e.target.value)}
                        />
                    </label> 
                </div>


                <div className="lat-lng">
                    <label className="lat">
                        Latitude <span className="errors">{hasSubmitted && errors.lat}</span>
                        <br></br>
                        <input 
                            className="lat-input"
                            type="text" 
                            value={lat}
                            placeholder="latitude"
                            onChange={(e) => setLat(e.target.value)}
                        />
                    </label> 
                    <p className="latlng-comma">,</p>
                    <label className="lng">
                        Longitude <span className="errors">{hasSubmitted && errors.lng}</span>
                        <br></br>
                        <input 
                            className="lng-input"
                            type="text" 
                            value={lng}
                            placeholder="longitude"
                            onChange={(e) => setLng(e.target.value)}
                        />
                    </label> 
                </div>
                <hr className="form-line"></hr>

                <h3>Describe your place to guests</h3>
                <label>Mention the best features of your space, any special amentities like fast wifi or parking, and what you love about the neighborhood.
                    <br></br>
                    <br></br>
                    <textarea 
                        className="textarea-description"
                        placeholder="Please write at least 30 characters"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>
                <div  className="errors">{hasSubmitted && errors.description}</div>
                <br></br>
                <hr className="form-line"></hr>

                <h3>Create a title for your spot</h3>
                <label>
                    Catch guests&apos; attention with a spot title that highlights what makes your place special.
                    <br></br>
                    <br></br>
                    <input 
                        className="regular-input"
                        type="text" 
                        value={name}
                        placeholder="Name of your spot"
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                <div  className="errors">{hasSubmitted && errors.name}</div>
                <br></br>
                <hr className="form-line"></hr>

                <h3>Set a base price for your spot</h3>
                <label>
                    Competitive pricing can help your listing stand out and rank higher in search results.
                    <br></br>
                    <br></br>
                    $ <input 
                        className="price-input"
                        type="text" 
                        value={price}
                        placeholder="Price per night (USD)"
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </label>
                <div  className="errors">{hasSubmitted && errors.price}</div>
                <br></br>
                <hr className="form-line"></hr>

                <h3>Liven up your spot with photos</h3>
                <label>
                    Submit a link to at least one photo to publish your spot.
                    <br></br>
                    <br></br>
                    <input 
                        className="regular-input"
                        type="text" 
                        value={previewImage}
                        placeholder="Preview Image URL"
                        onChange={(e) => setPreviewImage(e.target.value)}
                    />
                    <div  className="errors">{hasSubmitted && errors.previewImage}</div>
                    <br></br>

                    <input className="regular-input" type="text" placeholder="Image URL"
                    value={imageOne} 
                    onChange={(e) => setImageOne(e.target.value)}/>
                    <div  className="errors">{hasSubmitted && errors.imageOne}</div>
                    <br></br>
                    <input className="regular-input" type="text" placeholder="Image URL"
                     value={imageTwo}
                     onChange={(e) => setImageTwo(e.target.value)}/>
                    <div  className="errors">{hasSubmitted && errors.imageTwo}</div>
                    <br></br>
                    <input className="regular-input" type="text" placeholder="Image URL" 
                    value={imageThree}
                    onChange={(e) => setImageThree(e.target.value)}/>
                    <div className="errors">{hasSubmitted && errors.imageThree}</div>
                    <br></br>
                    <input className="regular-input" type="text" placeholder="Image URL" 
                    value={imageFour}
                    onChange={(e) => setImageFour(e.target.value)}/>
                    <div className="errors">{hasSubmitted && errors.imageFour}</div>
                    <br></br>
                </label>

                <hr className="form-line"></hr>
                <br></br>
                <div className="create-button-div">
                    <button className="create-button" type="submit">{formType}</button>
                </div>
                <br></br>
                {/* <hr className="footer-form-line"></hr>
                <footer>
                    <span><LiaCopyright /> 2024 Tabia Ye</span>
                </footer> */}
            </div> 
        </form>
    )
}

export default SpotForm;