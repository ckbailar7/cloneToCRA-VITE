import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ProtectedRoute from "./ProtectedRoute";
import ModalWithForm from "./ModalWithForm";
import ItemModal from "./ItemModal";
import RegisterModal from "./RegisterModal";
import LoginModal from "./LoginModal";
import UpdateProfileModal from "./UpdateProfileModal";
import Profile from "./Profile";
import AddItemModal from "./AddItemModal";
import { register, authorize } from "../utils/auth";
import { getToken, setToken } from "../utils/token";

// import { defaultClothingItems } from "../utils/constants";
import "../blocks/App.css";
import { useState, useEffect } from "react";
import {
  getForecastWeather,
  parseWeatherData,
  parseWeatherDataName,
} from "../utils/weatherApi";
import { Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { CurrentTemperatureUnitContext } from "../contexts/CurrentTemperatureUnitContext";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import "../utils/api";
import api from "../utils/api";

function App() {
  const [activeModal, setActiveModal] = useState("");
  const [selectedCard, setSelectedCard] = useState({});
  const [temp, setTemp] = useState(0);
  const [weatherData, setWeatherData] = useState({});
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentTemperatureUnit, setCurrentTemperatureUnit] = useState("F");
  const [defaultClothingItemsArray, setDefaultClothingItemsArray] = useState(
    []
  );

  // Sets isLoggedIn default value to false
  const [currentUser, setCurrentUser] = useState({
    username: "",
    email: "",
    name: "",
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  const handleMoveToRegisterModal = () => {
    // navigate("/register");
    setActiveModal("register");
  };

  const handleMoveToLoginModal = () => {
    setActiveModal("login");
  };

  const handleLoginModal = () => {
    setActiveModal("login");
  };

  const handleRegistrationModal = () => {
    setActiveModal("register");
  };

  const handleCreateModal = () => {
    setActiveModal("create");
  };

  const handleCloseModal = () => {
    setActiveModal("");
  };

  const handleSelectedCard = (card) => {
    setActiveModal("preview");
    setSelectedCard(card);
  };

  const handleUpdateProfileModal = () => {
    setActiveModal("updateProfile");
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
  };

  //const temp = weatherData.temperature;
  //console.log(weatherData.temperature[`${currentTemperatureUnit}`]);
  //console.log(`weatherData.temperature.C`, weatherData.temperature.C);
  //console.log(`currentTemperatureUnit`, currentTemperatureUnit);
  // console.log(weatherData.temperature);

  // const handleToggleSwitchChange = () => {
  //   if (currentTemperatureUnit === "F") {
  //     setCurrenTemperatureUnit("C");
  //     setTemp(weatherData.temperature["C"]);
  //   } else {
  //     setCurrenTemperatureUnit("F");
  //     setTemp(weatherData.temperature["F"]);
  //   }

  //   // currentTemperatureUnit === "F"
  //   //   ? setCurrenTemperatureUnit("C")
  //   //   : setCurrenTemperatureUnit("F");
  // };

  useEffect(() => {
    console.log("JWT Checking in local storage ");
    const jwt = getToken();

    if (!jwt) {
      return;
    }

    //api call
    api
      .getUserInfo(jwt)
      .then((res) => {
        //console.log("res from api.getUserInfo(jwt) ===>", res);
        if (res && res.email) {
          setCurrentUser(res);
          setIsLoggedIn(true);
        }
      })
      .catch((err) => console.error("Token validation failed", err));
    // .then(({ username, email }) => {
    //   //
    //   setIsLoggedIn(true);
    //   setCurrentUser({ username, email });
    //   const redirectPath = window.location.state?.from?.pathname || "/main";
    //   navigate(redirectPath);
    // })
    // .catch((err) => {
    //   console.log(err);
    // });

    // TODO - handle JWT
  }, []);

  const handleToggleSwitchChange = () => {
    if (currentTemperatureUnit === "C") setCurrentTemperatureUnit("F");
    if (currentTemperatureUnit === "F") setCurrentTemperatureUnit("C");
  };

  const onAddItem = ({ name, imageUrl, weather }) => {
    //console.log(`from onAddItem ... ${name}`);
    //console.log(`from onAddItem ... ${imageUrl}`);
    //console.log(`from onAddItem ... ${weather}`);

    api
      .addNewItem(name, imageUrl, weather)
      .then((addedItem) => {
        //console.log("added item from .then((addedItem) => {})");
        setDefaultClothingItemsArray((defaultClothingItemsArray) => [
          addedItem,
          ...defaultClothingItemsArray,
        ]);
        //console.log(`Added Item`, addedItem);
        //console.log(`Default ClothingItemsArray`, defaultClothingItemsArray);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onAttemptRegistration = ({ name, avatar, email, password }) => {
    // console.log(
    //   `Attempting registration with : ==> ${(name, avatar, email, password)}`
    // );
    register({ name, avatar, email, password })
      .then((res) => {
        // TODO
        //console.log(res);
        localStorage.setItem("jwt", res.token);
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleLogin = ({ email, password }) => {
    //console.log(`Attempting LOGIN with ==> ${email}, ${password}`);
    if (!email || !password) {
      return;
    }
    authorize({ email, password })
      .then((res) => {
        //console.log("Response from authorization", res);
        if (res.token) {
          setToken(res.token);
          setCurrentUser({
            username: res.username,
            email: res.email,
            name: "",
          });
          setIsLoggedIn(true);
          const redirectPath = window.location.state?.from?.pathname || "/";
          navigate(redirectPath);
          //console.log("currentUser", currentUser);
        } else {
          console.log("JWT token is missing in the response");
        }
      })

      .catch((err) => {
        console.error("Login error:", err);
      });
  };

  const handleChangeProfileData = ({ name, avatar }) => {
    console.log(`Attempting changeUserProfileData with ==> ${name}, ${avatar}`);
    if (!name || !avatar) {
      return;
    }

    api
      .handleUpdateCurrentUserProfile(name, avatar)
      .then((res) => {
        console.log("response from handleUpdateCurrentUserProfile ===>", res);
      })
      .catch((err) => {
        console.error("PROFILE UPDATE ERROR:", err);
      });
  };

  const handleCardLike = ({ id, isLiked }) => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      console.log("User not logged in . Cannot like or unlike items");
      return;
    }

    // Determine which api function to call based on current like status
    const apiFunction = isLiked
      ? api.handleRemoveLikeSelectedItem
      : api.handleLikeSelectedItem;

    apiFunction(id, token).then((updatedCard) => {
      setDefaultClothingItemsArray((cards) => {
        return cards.map((item) => (item._id === id ? updatedCard.data : item));
      });
    });

    // !isLiked
    //   ? api
    //       .handleLikeSelectedItem(id, token)
    //       .then((updatedCard) => {
    //         setDefaultClothingItemsArray((cards) =>
    //           cards.map((item) => (item._id ? updatedCard : item))
    //         );
    //       })
    //       .catch((err) => console.log(err))
    //   : api
    //       .handleRemoveLikeSelectedItem(id, token)
    //       .then((updatedCard) => {
    //         setDefaultClothingItemsArray((cards) =>
    //           cards.map((item) => (item._id === id ? updatedCard : item))
    //         );
    //       })
    //       .catch((err) => console.log(err));
  };

  // const handleCardLike = (id, isLiked) => {
  //   const token = localStorage.getItem("jwt");

  //   const apiFunction = isLiked
  //     ? api.handleLikeSelectedItem
  //     : api.handleRemoveLikeSelectedItem;

  //   apiFunction(id, token)
  //     .then((updatedCard) => {
  //       setDefaultClothingItemsArray((cards) =>
  //         cards.map((item) => (item._id === id ? updatedCard : item))
  //       );
  //     })
  //     .catch((err) => {
  //       console.error("Error updating card like status", err);
  //     });
  // };

  // const handleCardLikeoriginal = (id, isLiked) => {
  //   const token = localStorage.getItem("jwt");

  //   console.log("id being received in handleCardLikeAPP>JSX => ", id);

  //   // Determine the endpoint based on like status
  //   // const apiFunction = isLiked
  //   //   ? api.handleRemoveLikeSelectedItem
  //   //   : api.handleLikeSelectedItem;

  //   // Call the apropriate function
  //   // apiFunction(id, token)
  //   //   .then((updatedCard) => {
  //   //     Update the state to reflect the new like status
  //   //     setDefaultClothingItemsArray((cards) =>
  //   //       cards.map((item) => (item._id === id ? updatedCard : item))
  //   //     );
  //   //   })
  //   //   .catch((err) => {
  //   //     console.error("Card Like error", err);
  //   //   });

  //   // Check if card is currently liked
  //   //if so, send request to add the users id to the cards likes array
  //   isLiked
  //     ? api
  //         .handleLikeSelectedItem(id, token)
  //         .then((updatedCard) => {
  //           setDefaultClothingItemsArray((cards) =>
  //             cards.map((item) => (item._id === id ? updatedCard : item))
  //           );
  //         })
  //         .catch((err) => {
  //           console.log("Card Like ERROR", err);
  //         })
  //     : api
  //         .handleRemoveLikeSelectedItem(id)
  //         .then((updatedCard) => {
  //           setDefaultClothingItemsArray((cards) =>
  //             cards.map((item) => (item._id === id ? updatedCard : item))
  //           );
  //         })
  //         .catch((err) => {
  //           console.error("Card remove Like Error", err);
  //         });
  // };

  useEffect(() => {
    getForecastWeather()
      .then((data) => {
        const currentLocation = parseWeatherDataName(data);
        setCurrentLocation(currentLocation);
        const temperature = parseWeatherData(data);

        setWeatherData(temperature);
        setTemp(temperature);
        console.log(`weatherDataParsed`, temperature);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    api
      .getItems()
      .then((data) => {
        //console.log("Data being received =>>", data.data);
        if (data.data && Array.isArray(data.data)) {
          setDefaultClothingItemsArray(data.data);
        } else {
          console.log("expected Array but insteadd received : ", data);
        }
        //console.log(defaultClothingItemsArray);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    const closeByEscape = (e) => {
      if (e.key === "Escape") {
        handleCloseModal();
      }
    };

    document.addEventListener("keydown", closeByEscape);
    return () => {
      document.removeEventListener("keydown", closeByEscape);
    };
  }, []);

  useEffect(() => {
    console.log("CURRENT ActiveMODAL", activeModal);
  }, []);

  const handleDeleteSelectedItem = (id) => {
    console.log("Deleting item with ID:", id);
    api
      .handleDeleteSelectedItem(id)
      .then(() => {
        setDefaultClothingItemsArray((defaultClothingItemsArray) =>
          defaultClothingItemsArray.filter((item) => item.id !== id)
        );
        handleCloseModal();
      })
      // .then(() => {
      //   handleCloseModal();
      // })
      .catch((err) => {
        console.log("Error deleting item", err);
      });
  };

  console.log(`currentTemperatureUnit`, currentTemperatureUnit);

  return (
    <div id="content__container">
      <CurrentUserContext.Provider value={currentUser}>
        <CurrentTemperatureUnitContext.Provider
          value={{ currentTemperatureUnit, handleToggleSwitchChange }}
        >
          <Header
            onCreateModal={handleCreateModal}
            onCreateRegisterModal={handleRegistrationModal}
            onCreateLoginModal={handleLoginModal}
            currentLocation={currentLocation}
            temp={temp}
            handleToggleSwitchChange={handleToggleSwitchChange}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
          />
          <Routes>
            <Route
              path="/"
              element={
                <Main
                  onSelectCard={handleSelectedCard}
                  weatherTemp={temp}
                  //currentTemp={temp}
                  newGeneratedCards={defaultClothingItemsArray}
                  onCardLike={handleCardLike}
                  currentUser={currentUser}
                />
              }
            ></Route>
            <Route
              path="/profile"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Profile
                    currentTemp={temp}
                    newGeneratedCards={defaultClothingItemsArray}
                    weatherTemp={currentTemperatureUnit}
                    onSelectCard={handleSelectedCard}
                    onCreateModal={handleCreateModal}
                    isLoggedIn={isLoggedIn}
                    currentUser={currentUser}
                    onCreateUpdateUserModal={handleUpdateProfileModal}
                    handleChangeProfileData={handleChangeProfileData}
                    onCardLike={handleCardLike}
                    handleSignOut={handleSignOut}
                  />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/login"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn} anonymous>
                  <LoginModal
                    onCloseModal={handleCloseModal}
                    handleLogin={handleLogin}
                    buttonText-={"Login"}
                    handleMoveToRegisterModal={handleMoveToRegisterModal}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn} anonymous>
                  <RegisterModal
                    onCloseModal={handleCloseModal}
                    buttonText={"Sign up"}
                    onAttemptRegistration={onAttemptRegistration}
                    handleMoveToLoginModal={handleMoveToLoginModal}
                  />
                </ProtectedRoute>
              }
            />
          </Routes>

          <Footer />
          {activeModal === "create" && (
            <AddItemModal
              onCloseModal={handleCloseModal}
              onAddItem={onAddItem}
              buttonText={"Add garment"}
            />
          )}

          {activeModal === "preview" && (
            <ItemModal
              onSelectCard={handleSelectedCard}
              selectedCard={selectedCard}
              onClose={handleCloseModal}
              //onDelete={handleTESTDeleteItem}
              onDelete={handleDeleteSelectedItem}
              currentUser={currentUser}
            />
          )}

          {activeModal === "register" && (
            <RegisterModal
              onCloseModal={handleCloseModal}
              onAttemptRegistration={onAttemptRegistration}
              buttonText={"Sign up"}
              handleMoveToLoginModal={handleMoveToLoginModal}
            />
          )}
          {activeModal === "login" && (
            <LoginModal
              onCloseModal={handleCloseModal}
              handleLogin={handleLogin}
              buttonText={"Login"}
              handleMoveToRegisterModal={handleMoveToRegisterModal}
            />
          )}
          {activeModal === "updateProfile" && (
            <UpdateProfileModal
              onCloseModal={handleCloseModal}
              handleChangeProfileData={handleChangeProfileData}
              buttonText={"Save changes"}
              currentUser={currentUser}
            />
          )}
        </CurrentTemperatureUnitContext.Provider>
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;
