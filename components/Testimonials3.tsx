import Image from "next/image";
import { StaticImageData } from "next/image";
import config from "@/config";

// The list of your testimonials. It needs 3 items to fill the row.
const list: {
  title: string;
  practice?: string;
  name: string;
  text: string;
  img?: string | StaticImageData;
}[] = [
  {
    title: "MD",
    practice: "Lakeside Family Practice",
    name: "Dr. Sarah Chen",
    text: "Our AI Employee has transformed how we handle patient calls. We've reduced missed appointments by 35% and our staff is now focused on in-office care instead of constantly answering phones. The ROI was evident within the first month.",
    img: "/images/testimonials/doctor-female.svg",
  },
  {
    title: "JD",
    practice: "Davidson & Associates Law Firm",
    name: "Michael Davidson",
    text: "As a small law practice, we were missing potential clients when we couldn't answer calls. Our AI Employee now handles initial client screening 24/7, schedules consultations, and has increased our new client acquisition by 40%.",
    img: "/images/testimonials/lawyer-male.svg",
  },
  {
    title: "Office Manager",
    practice: "Northwest Orthopedic Center",
    name: "Jennifer Martinez",
    text: "Implementation was seamless - our AI Employee was up and running in days, not weeks. It handles our high call volume flawlessly, and patients regularly comment on how pleasant and efficient their scheduling experience has been. Worth every penny.",
    img: "/images/testimonials/manager-female.svg",
  },
];

// A single testimonial, to be rendered in  a list
const Testimonial = ({ i }: { i: number }) => {
  const testimonial = list[i];

  if (!testimonial) return null;

  return (
    <li key={i}>
      <figure className="relative max-w-lg h-full p-6 md:p-10 bg-base-200 rounded-2xl max-md:text-sm flex flex-col shadow-lg">
        <blockquote className="relative flex-1">
          <p className="text-base-content/80 leading-relaxed">
            {testimonial.text}
          </p>
        </blockquote>
        <figcaption className="relative flex items-center justify-start gap-4 pt-4 mt-4 md:gap-8 md:pt-8 md:mt-8 border-t border-base-content/5">
          <div className="w-full flex items-center justify-between gap-2">
            <div>
              <div className="font-medium text-base-content md:mb-0.5">
                {testimonial.name}, {testimonial.title}
              </div>
              {testimonial.practice && (
                <div className="mt-0.5 text-sm text-base-content/80">
                  {testimonial.practice}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-full bg-base-300 shrink-0">
              {testimonial.img ? (
                <Image
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                  src={list[i].img}
                  alt={`${list[i].name}'s testimonial for ${config.appName}`}
                  width={48}
                  height={48}
                />
              ) : (
                <span className="w-10 h-10 md:w-12 md:h-12 rounded-full flex justify-center items-center text-lg font-medium bg-base-300">
                  {testimonial.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
        </figcaption>
      </figure>
    </li>
  );
};

const Testimonials3 = () => {
  return (
    <section id="testimonials" className="bg-base-100">
      <div className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col text-center w-full mb-16">
          <h2 className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
            Trusted by <span className="text-primary">Healthcare</span> and <span className="text-primary">Legal</span> Professionals
          </h2>
          <p className="lg:w-2/3 mx-auto leading-relaxed text-lg text-base-content/70">
            See how practices like yours are transforming patient and client experiences with AI Employees
          </p>
        </div>

        <ul
          role="list"
          className="flex flex-col items-center lg:flex-row lg:items-stretch gap-6 lg:gap-8"
        >
          {[...Array(3)].map((e, i) => (
            <Testimonial key={i} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Testimonials3;
