import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  registerOwnerService,
} from "../services/register-owner.service";


export function RegisterPage() {


  const navigate =
    useNavigate();



  const [
    businessName,
    setBusinessName,
  ] = useState("");



  const [
    ownerName,
    setOwnerName,
  ] = useState("");



  const [
    email,
    setEmail,
  ] = useState("");



  const [
    password,
    setPassword,
  ] = useState("");



  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");



  const [
    country,
    setCountry,
  ] = useState("Thailand");



  const [
    currency,
    setCurrency,
  ] = useState("THB");



  const [
    loading,
    setLoading,
  ] = useState(false);



  const [
    error,
    setError,
  ] = useState("");



  async function handleSubmit(
    event: React.FormEvent,
  ) {


    event.preventDefault();


    setError("");



    if (
      password !== confirmPassword
    ) {

      setError(
        "Passwords do not match",
      );

      return;

    }



    setLoading(true);



    try {


      const result =
        await registerOwnerService.execute({

          businessName,

          ownerName,

          email,

          password,

          country,

          currency,

        });



      console.log(
        "Registration successful:",
        result,
      );



      navigate("/");



    } catch (error) {


      console.error(
        "Registration error:",
        error,
      );



      if (error instanceof Error) {

        setError(
          error.message,
        );

      } else {

        setError(
          JSON.stringify(error),
        );

      }


    } finally {


      setLoading(false);


    }

  }




  return (

    <div className="flex min-h-screen items-center justify-center">


      <form

        onSubmit={handleSubmit}

        className="w-full max-w-lg space-y-4 rounded-lg border p-6"

      >


        <h1 className="text-2xl font-bold">

          Create Your Company

        </h1>



        <input

          placeholder="Business Name"

          value={businessName}

          onChange={(e) =>
            setBusinessName(
              e.target.value,
            )
          }

          className="w-full rounded border p-2"

        />



        <input

          placeholder="Owner Name"

          value={ownerName}

          onChange={(e) =>
            setOwnerName(
              e.target.value,
            )
          }

          className="w-full rounded border p-2"

        />



        <input

          type="email"

          placeholder="Email"

          value={email}

          onChange={(e) =>
            setEmail(
              e.target.value,
            )
          }

          className="w-full rounded border p-2"

        />



        <input

          type="password"

          placeholder="Password"

          value={password}

          onChange={(e) =>
            setPassword(
              e.target.value,
            )
          }

          className="w-full rounded border p-2"

        />



        <input

          type="password"

          placeholder="Confirm Password"

          value={confirmPassword}

          onChange={(e) =>
            setConfirmPassword(
              e.target.value,
            )
          }

          className="w-full rounded border p-2"

        />



        <input

          placeholder="Country"

          value={country}

          onChange={(e) =>
            setCountry(
              e.target.value,
            )
          }

          className="w-full rounded border p-2"

        />



        <input

          placeholder="Currency"

          value={currency}

          onChange={(e) =>
            setCurrency(
              e.target.value,
            )
          }

          className="w-full rounded border p-2"

        />



        {
          error && (

            <div className="rounded bg-red-100 p-3 text-red-700">

              {error}

            </div>

          )
        }



        <button

          type="submit"

          disabled={loading}

          className="w-full rounded bg-green-600 p-2 text-white"

        >

          {
            loading

              ? "Creating company..."

              : "Create Company"
          }


        </button>



      </form>


    </div>

  );

}