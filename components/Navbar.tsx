import Image from "next/image";
import { OnboardingButton } from "components/buttons/OnboardingButton";
import Link from "next/link";

export function Navbar() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col lg:flex-row justify-center items-center lg:justify-between h-auto lg:h-16">
          <div className="flex order-last lg:order-first mb-3 lg:mb-0">
            <div className="flex-shrink-0 flex items-center ">
              <div className="ml-0 lg:ml-10 mr-4 w-6">
                <Image
                  src="/images/logo-apple-liquidator.png"
                  alt="Apple Liquidator Logo"
                  width="100"
                  height="158"
                />
              </div>

              <div className="uppercase text-gray-900 text-3xl font-display ">
                <Link href="/">Apple Liquidator</Link>
              </div>
            </div>
          </div>
          <div className="flex items-center mt-0 mb-8 lg:mb-0 lg:mt-0">
            <div className="flex-shrink-0">
              <OnboardingButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
