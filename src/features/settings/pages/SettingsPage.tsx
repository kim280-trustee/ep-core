import {
  useSettings,
} from "../hooks";


export default function SettingsPage() {


  const {
    settings,
  } = useSettings();



  return (

    <div>


      <h1>

        Company Settings

      </h1>



      {

        settings ? (

          <div>


            <p>

              Business:

              {" "}

              {settings.businessName}

            </p>



            <p>

              Country:

              {" "}

              {settings.country}

            </p>



            <p>

              Currency:

              {" "}

              {settings.currency}

            </p>



            <p>

              Tax Rate:

              {" "}

              {settings.taxRate}%

            </p>


          </div>

        ) : (

          <p>

            No settings configured.

          </p>

        )

      }


    </div>

  );

}