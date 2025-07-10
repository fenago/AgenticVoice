import config from "@/config";
import ButtonCheckout from "./ButtonCheckout";

// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

const Pricing = () => {
  return (
    <section className="bg-base-200 overflow-hidden" id="pricing">
      <div className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col text-center w-full mb-16">
          <h2 className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
            Hire Your <span className="text-primary">AI Employee</span> Today
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-base-content/70">
            Choose the right plan for your practice. All plans include training, implementation, and ongoing support.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch pt-4">
          {config.stripe.plans.map((plan) => (
            <div key={plan.priceId} className="relative w-full">
              {plan.isFeatured && (
                <div
                  className={`absolute -inset-[1px] rounded-[9px] bg-purple-600 z-10`}
                ></div>
              )}

              <div className="relative flex flex-col h-full gap-5 lg:gap-6 z-10 bg-base-100 p-6 rounded-lg">
                {plan.isFeatured && (
                  <div className="absolute top-0 left-0 right-0 bg-purple-600 text-white text-xs font-bold text-center py-2 -mx-6 -mt-6 rounded-t-lg">
                    MOST POPULAR
                  </div>
                )}
                <div className={`flex flex-col gap-2 ${plan.isFeatured ? 'mt-6' : ''}`}>
                  <p className="text-lg lg:text-xl font-bold">{plan.name}</p>
                  {plan.description && (
                    <p className="text-sm text-base-content/80">
                      {plan.description}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-1">
                  {plan.priceAnchor && (
                    <div className="flex gap-2 items-center">
                      <p className="relative text-base-content/60">
                        <span className="absolute bg-base-content h-[1.5px] inset-x-0 top-[53%]"></span>
                        <span>${plan.priceAnchor}</span>
                      </p>
                    </div>
                  )}
                  {plan.isPayPerUse ? (
                    <div>
                      <p className="text-2xl font-bold text-primary">{plan.priceNote}</p>
                      <p className="text-xs text-base-content/60 uppercase font-semibold mt-1">
                        No monthly fee
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className={`text-3xl lg:text-4xl tracking-tight font-extrabold`}>
                        ${plan.price}
                      </p>
                      <p className="text-xs text-base-content/60 uppercase font-semibold mt-1">
                        USD/month
                      </p>
                    </div>
                  )}
                </div>
                
                {plan.features && (
                  <ul className="space-y-2 leading-relaxed text-sm flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4 opacity-80 shrink-0 mt-0.5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>

                        <span>{feature.name} </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="space-y-3">
                  <ButtonCheckout
                priceId={plan.priceId}
                planName={plan.name}
                mode={plan.priceId === config.stripe.plans[0].priceId ? "payment" : "subscription"}
              />

                  <p className="flex items-center justify-center gap-2 text-xs text-center text-base-content/60 font-medium relative">
                    {plan.name === "Professional" ? 
                      "Best value for growing practices" : 
                      plan.name === "Pay Per Use" ?
                      "Try risk-free today" :
                      plan.name === "Starter" ?
                      "Great for getting started" :
                      plan.name === "Business" ?
                      "Scale with confidence" :
                      "Custom solutions available"
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
