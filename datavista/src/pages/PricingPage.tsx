import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/payments';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export interface Plan {
  name: 'Free' | 'Pro' | 'Enterprise';
  price: number;
  description: string;
  features: string[];
  mostPopular: boolean;
  buttonText: string;
  color: string;
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for trying out DataVista',
    features: [
      'Upload up to 5 datasets',
      'Basic visualizations',
      'Export as PDF',
      'Community support'
    ],
    mostPopular: false,
    buttonText: 'Current Plan',
    color: 'gray'
  },
  {
    name: 'Pro',
    price: 9.99,
    description: 'For professionals and small teams',
    features: [
      'Everything in Free',
      'Upload unlimited datasets',
      'Advanced AI insights',
      'Custom charts and dashboards',
      'Priority email support',
      'Team collaboration (up to 3 users)'
    ],
    mostPopular: true,
    buttonText: 'Upgrade to Pro',
    color: 'purple'
  },
  {
    name: 'Enterprise',
    price: 39.99,
    description: 'For organizations with advanced needs',
    features: [
      'Everything in Pro',
      'Dedicated success manager',
      'Custom integrations',
      'Advanced security features',
      'Team collaboration (unlimited)',
      'Training and onboarding',
      'SLA guarantees'
    ],
    mostPopular: false,
    buttonText: 'Contact Sales',
    color: 'indigo'
  }
];

const PricingPage = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const navigate = useNavigate();
  const { user, recordPayment, updateSubscription } = useAuth();

  useEffect(() => {
    const src = 'https://checkout.razorpay.com/v1/checkout.js';
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUpgrade = async (plan: Plan) => {
    if (plan.name === 'Free') return;
    if (plan.name === 'Enterprise') {
      navigate('/contact-sales');
      return;
    }

    if (!user) {
      alert('Please login to upgrade your plan');
      navigate('/login');
      return;
    }

    const base = plan.price * (billingPeriod === 'annual' ? 0.8 : 1);
    const amountInCents = Math.round(base * 100);

    try {
      const createRes = await fetch(`${API_BASE_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInCents,
          planName: plan.name,
          billingPeriod,
          currency: 'USD'
        })
      }).then(r => r.json());

      if (!createRes.success) throw new Error(createRes.error || 'Order error');
      const { order } = createRes;

      const options: any = {
        key: RAZORPAY_KEY_ID,
        name: 'DataVista',
        description: `${plan.name} subscription (${billingPeriod})`,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency || 'USD',
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planName: plan.name,
                billingPeriod
              })
            }).then(r => r.json());

            if (verifyRes.success) {
              const startDate = new Date();
              const endDate = new Date();
              endDate.setMonth(endDate.getMonth() + (billingPeriod === 'annual' ? 12 : 1));

              // Record payment
              await recordPayment({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: amountInCents / 100,
                currency: 'USD',
                planName: plan.name,
                billingPeriod,
                paymentMethod: response.method || 'card',
                transactionId: response.razorpay_payment_id,
                receiptUrl: `https://dashboard.razorpay.com/#/app/payments/${response.razorpay_payment_id}`
              });

              // Update subscription
              await updateSubscription({
                name: plan.name,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                billingPeriod,
                status: 'active',
                lastPaymentId: response.razorpay_payment_id
              });

              alert('Payment successful ✅');
              navigate('/dashboard');
            } else {
              throw new Error(verifyRes.error || 'Verification failed');
            }
          } catch (error: any) {
            console.error('Payment processing error:', error);
            alert(`Payment processing failed: ${error.message}`);
          }
        },
        prefill: {
          name: user.name || 'DataVista User',
          email: user.email || 'user@example.com'
        },
        modal: {
          ondismiss() {
            console.log('Payment modal dismissed');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      alert(`Payment failed – ${err.message}`);
      
      if (user) {
        try {
          await recordPayment({
            paymentId: `attempt_${Date.now()}`,
            orderId: '',
            amount: amountInCents / 100,
            currency: 'USD',
            planName: plan.name,
            billingPeriod,
            paymentMethod: 'none',
            status: 'failed'
          });
        } catch (dbError) {
          console.error('Failed to record payment attempt:', dbError);
        }
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
    })
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='pb-24 pt-12'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center max-w-3xl mx-auto mb-16'
          >
            <h2 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
              Simple, Transparent Pricing
            </h2>
            <p className='mt-4 text-lg text-gray-600'>
              Choose the perfect plan for your data needs
            </p>

            <div className='mt-8 flex justify-center'>
              <div className='relative bg-gray-100 p-1 rounded-full flex'>
                {(['monthly', 'annual'] as const).map(period => (
                  <button
                    key={period}
                    onClick={() => setBillingPeriod(period)}
                    className={`relative py-2 px-6 rounded-full text-sm font-medium ${
                      billingPeriod === period
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {period === 'annual' ? (
                      <>
                        Annual <span className='text-green-600 font-bold'>‑20%</span>
                      </>
                    ) : (
                      'Monthly'
                    )}
                  </button>
                ))}
                <div
                  className={`absolute inset-0 m-1 pointer-events-none transition-all duration-300 ease-in-out ${
                    billingPeriod === 'annual' ? 'translate-x-full' : 'translate-x-0'
                  }`}
                  style={{
                    width: 'calc(50% - 0.5rem)',
                    borderRadius: '9999px',
                    background: 'linear-gradient(to right, #8b5cf6, #6366f1)'
                  }}
                />
              </div>
            </div>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {plans.map((plan, index) => {
              const displayPrice =
                billingPeriod === 'annual'
                  ? Math.round(plan.price * 0.8 * 100) / 100
                  : plan.price;

              return (
                <motion.div
                  key={plan.name}
                  custom={index}
                  variants={cardVariants}
                  initial='hidden'
                  animate='visible'
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`relative rounded-2xl overflow-hidden ${
                    plan.mostPopular
                      ? 'border-2 border-purple-500 shadow-xl'
                      : 'border border-gray-200 shadow-md'
                  } bg-white`}
                >
                  {plan.mostPopular && (
                    <div className='absolute top-0 right-0 left-0 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold text-center'>
                      Most Popular
                    </div>
                  )}

                  <div className={`px-6 py-8 ${plan.mostPopular ? 'pt-10' : ''}`}>
                    <h3 className='text-xl font-semibold text-gray-900'>
                      {plan.name}
                    </h3>

                    <div className='mt-4 flex items-baseline'>
                      <span className='text-4xl font-bold text-gray-900'>
                        ${displayPrice.toFixed(2)}
                      </span>
                      <span className='ml-1 text-gray-600'>/month</span>
                    </div>
                    {billingPeriod === 'annual' && (
                      <div className='mt-1 text-sm text-green-600 font-medium'>
                        Billed annually
                      </div>
                    )}
                    <p className='mt-2 text-gray-600'>{plan.description}</p>

                    <ul className='mt-6 space-y-3'>
                      {plan.features.map((feature, i) => (
                        <li key={i} className='flex items-start'>
                          <div className='flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-purple-100 text-purple-600'>
                            <Check className='w-3.5 h-3.5' />
                          </div>
                          <span className='ml-2 text-sm text-gray-600'>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <motion.button
                      whileHover={{ scale: plan.name === 'Free' ? 1 : 1.02 }}
                      whileTap={{ scale: plan.name === 'Free' ? 1 : 0.98 }}
                      className={`mt-8 w-full py-3 px-4 rounded-md flex items-center justify-center text-center font-medium transition-colors ${
                        plan.name === 'Free'
                          ? 'bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed'
                          : plan.mostPopular
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                      }`}
                      onClick={() => handleUpgrade(plan)}
                      disabled={plan.name === 'Free'}
                    >
                      {plan.buttonText}
                      {plan.name !== 'Free' && (
                        <ChevronRight className='ml-1 w-4 h-4' />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className='mt-16 text-center'>
            <h3 className='text-lg font-medium text-gray-900'>
              Need a custom solution?
            </h3>
            <p className='mt-2 text-gray-600'>
              Contact our sales team for a tailored package that meets your
              specific requirements.
            </p>
            <button
              className='mt-4 inline-flex items-center px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors'
              onClick={() => navigate('/contact-sales')}
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;