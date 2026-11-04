import Button from "./Button.jsx";
import Icon from "./Icon.jsx";
import signal from "../assets/signal.svg";
import arrowRight from "../assets/arrow-right.svg";
import separator from "../assets/separator.svg";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="flex flex-col items-center gap-[25px] px-6 pb-12 pt-[52px] text-center lg:gap-[26px] lg:px-[220px] lg:pb-[58px] lg:pt-[82px]">
      <div className="flex items-center gap-[7px] rounded-full border border-border bg-surface px-[11px] py-2 lg:gap-2.5 lg:px-3">
        <span className="size-[5px] overflow-hidden lg:size-1.5">
          <Icon src={signal} alt="" />
        </span>
        <p className="text-[10px] text-muted lg:text-[11px]">
          A little clarity. A lot more possibility.
        </p>
        <span className="hidden size-3 overflow-hidden lg:block">
          <Icon src={arrowRight} alt="" />
        </span>
      </div>

      <h1 className="max-w-[1000px] text-[51px] leading-[1.08] font-normal tracking-[-2.8px] lg:text-[82px] lg:leading-[1.06] lg:tracking-[-4.5px]">
        Your money.
        <br />
        Your next chapter.
      </h1>

      <p className="max-w-[560px] text-[15px] leading-[1.7] text-muted lg:text-[18px] lg:leading-[1.65]">
        Less wondering where it went. More deciding where it goes. Meet the
        calmer way to track, plan, and grow your money.
      </p>

      <div className="flex w-full flex-col gap-2.5 lg:w-auto lg:flex-row lg:gap-3">
        
          <Button inert showArrow className="w-full lg:w-auto">
            <Link to="/login">  
            Get Started — it’s free
            </Link>
          </Button>
        
        
          <Button variant="secondary" inert className="w-full lg:w-auto">
            <Link to="/login">
            Log In
            </Link>
          </Button>

      </div>

      <div className="flex items-center gap-[18px] text-[11px] text-subtle">
        <p>No credit card required</p>
        <span className="size-[3px] overflow-hidden">
          <Icon src={separator} alt="" />
        </span>
        <p>Set up in minutes</p>
      </div>
    </section>
  );
}
