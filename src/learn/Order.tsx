import { Component, useState } from "react";
import { RestAPI } from "@aws-amplify/api-rest";
import { Elements, StripeProvider } from "react-stripe-elements";
import { Button } from "@mui/material";
import BillingForm from "./BillingForm";
import { successToast } from "../libs/toasts";
import { createExperience } from "../libs/createExperience";
import { User } from "../types";
import { RouterHistory } from "@sentry/react/types/reactrouter";

/**
 * Parent component of the Billing form.
 * @TODO Issue #50
 */

interface OrderProps {
  user: User;
  initialFetch: (id: string) => void;
  history: RouterHistory;
  stripeKey: string;
}

const Order = ({ user, initialFetch, history, stripeKey }: OrderProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const billUser = (details: any) => {
    let route;
    if (import.meta.env.NODE_ENV === "development") {
      route = "/billing-dev";
    } else {
      route = "/billing";
    }
    return RestAPI.post("util", route, {
      body: details,
    });
  };

  const unlockLearning = async () => {
    let body = {
      learningPurchase: true,
    };

    let updatedUser = await RestAPI.put("pareto", `/users/${user.id}`, {
      body,
    });
    console.log(updatedUser);

    let apprenticeParams = {
      expId: user.apprenticeshipId,
      userId: user.id,
      type: "Apprenticeship",
      title: "Dev Onboarding",
      description: "Learning the tools, habits and workflows of development.",
    };
    const createApprenticeship = await createExperience(apprenticeParams);
    console.log("Created Apprenticeship: ", createApprenticeship);
    let productParams = {
      expId: user.productId,
      userId: user.id,
      type: "Product",
      title: "Capstone Project",
      description:
        "The critical piece of your portfolio that will get you the interview, and help you demonstrate your skills and potential.",
    };
    const createProduct = await createExperience(productParams);
    console.log("Created Product: ", createProduct);
    let interviewingParams = {
      expId: user.masteryId,
      userId: user.id,
      type: "Interviewing",
      title: "Interviewing",
      description:
        "The computer science you need to pass technical interviews.",
    };
    const createInterviewing = await createExperience(interviewingParams);
    console.log(createInterviewing);

    // const defaultMentor = await API.post('pareto', '/relationship', {
    // 	body: {
    // 		id: `${this.state.admin.id}_${newUser.id}`,
    // 		mentee: newUser,
    // 		mentor: this.state.admin,
    // 		tasks: [],
    // 		coachId: this.state.admin.id,
    // 		athleteId: newUser.id,
    // 		resources: [],
    // 		events: [],
    // 		reminders: [],
    // 		accepted: true,
    // 		completed: false,
    // 		createdAt: new Date()
    // 	}
    // });

    // console.log('New mentor: ', defaultMentor);
  };

  const handleFormSubmit = async (
    storage: any,
    { token, error }: { token: any; error: Error }
  ) => {
    if (error) {
      alert(error);
      return;
    }

    setIsLoading(true);

    try {
      let billing = await billUser({
        storage,
        source: token.id,
      });
      console.log("bill: ", billing);
      successToast(
        "Your card has been charged successfully! We are creating your learning account."
      );

      if (billing.status === true) {
        // create learning account info
        await unlockLearning();
      }

      await initialFetch(user._id);
      history.push("/training");
    } catch (e) {
      alert(e);
      setIsLoading(false);
    }
  };

  const handleFreeUnlock = async () => {
    setIsLoading(true);

    try {
      await unlockLearning();
      await initialFetch(user._id);
      history.push("/training");
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      <div className="Form">
        <StripeProvider apiKey={stripeKey}>
          <Elements>
            <BillingForm loading={isLoading} onSubmit={handleFormSubmit} />
          </Elements>
        </StripeProvider>
      </div>
      <Button onClick={handleFreeUnlock}>No Donation</Button>
    </>
  );
};

export default Order;

//(property) loading: boolean
//Type '{
//      loading: boolean;
//       onSubmit: (storage: any, { token, error }: { token: any; error: any; }) => Promise<void>; }' is not assignable to type 'IntrinsicAttributes & object'.
// Property 'loading' does not exist on type 'IntrinsicAttributes & object'.ts(2322)
