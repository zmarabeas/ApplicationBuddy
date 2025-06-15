import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/contexts/ProfileContext";
import { useState, useEffect } from "react";
import { FormAnimation, FormFields, FormFieldItem, AnimatedButton, SuccessAnimation } from "@/components/ui/form-animation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

// Form schema
const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

type PersonalInfo = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  links?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
};

export default function PersonalInfoForm() {
  const { profileData, updatePersonalInfo } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Get personal info from profile data
  const personalInfo: PersonalInfo = profileData?.profile?.personalInfo || {};
  
  // Add mounting animation
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Default values for the form
  const defaultValues: PersonalInfoFormValues = {
    firstName: personalInfo?.firstName || "",
    lastName: personalInfo?.lastName || "",
    email: personalInfo?.email || "",
    phone: personalInfo?.phone || "",
    street: personalInfo?.address?.street || "",
    city: personalInfo?.address?.city || "",
    state: personalInfo?.address?.state || "",
    zip: personalInfo?.address?.zip || "",
    country: personalInfo?.address?.country || "",
    linkedin: personalInfo?.links?.linkedin || "",
    github: personalInfo?.links?.github || "",
    portfolio: personalInfo?.links?.portfolio || "",
  };

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues,
  });

  const onSubmit = async (values: PersonalInfoFormValues) => {
    try {
      setSaveSuccess(false);
      setIsSaving(true);
      
      // Format the data to match the expected structure
      const formattedData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zip: values.zip,
          country: values.country,
        },
        links: {
          linkedin: values.linkedin,
          github: values.github,
          portfolio: values.portfolio,
        },
      };
      
      // Update the personal info
      await updatePersonalInfo(formattedData);
      
      // Show success animation
      setSaveSuccess(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving personal info:", error);
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormAnimation>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <FormFields>
            <motion.div className="p-6 rounded-lg border border-border mb-6">
              <motion.h3 
                className="text-md font-medium text-foreground mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                [ Personal Information ]
              </motion.h3>
              
              <div className="mt-3 grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-6">
                <FormFieldItem className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} className="transition-all duration-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormFieldItem>
                <FormFieldItem className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} className="transition-all duration-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormFieldItem>
                <FormFieldItem className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" {...field} className="transition-all duration-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormFieldItem>
                <FormFieldItem className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} className="transition-all duration-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormFieldItem>
              </div>
            </motion.div>
          </FormFields>

          {/* Address Section */}
          <FormFields>
            <motion.div className="p-6 rounded-lg border border-border mb-6">
              <motion.h3 
                className="text-md font-medium text-foreground mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                [ Address Information ]
              </motion.h3>
              
              <div className="mt-3 grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-6">
                <FormFieldItem className="sm:col-span-6">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} className="transition-all duration-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormFieldItem>
                <FormFieldItem className="sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco" {...field} className="transition-all duration-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormFieldItem>
                <FormFieldItem className="sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State / Province</FormLabel>
                        <FormControl>
                          <Input placeholder="CA" {...field} className="transition-all duration-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormFieldItem>
                <FormFieldItem className="sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP / Postal code</FormLabel>
                        <FormControl>
                          <Input placeholder="94103" {...field} className="transition-all duration-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormFieldItem>
                <FormFieldItem className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} className="transition-all duration-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormFieldItem>
              </div>
            </motion.div>
          </FormFields>

          {/* Online Profiles Section */}
          <FormFields>
            <motion.div className="p-6 rounded-lg border border-border mb-6">
              <motion.h3 
                className="text-md font-medium text-foreground mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                [ Online Profiles ]
              </motion.h3>
              
              <div className="mt-3 grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-6">
                <FormFieldItem className="sm:col-span-6">
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/yourusername" {...field} className="transition-all duration-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormFieldItem>
                <FormFieldItem className="sm:col-span-6">
                  <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/yourusername" {...field} className="transition-all duration-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormFieldItem>
                <FormFieldItem className="sm:col-span-6">
                  <FormField
                    control={form.control}
                    name="portfolio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio / Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourwebsite.com" {...field} className="transition-all duration-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormFieldItem>
              </div>
            </motion.div>
          </FormFields>

          <div className="flex justify-end space-x-4 items-center">
            {saveSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-green-500 flex items-center"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <span>Saved successfully!</span>
              </motion.div>
            )}
            
            <AnimatedButton>
              <Button 
                type="submit" 
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </span>
                ) : "Save Information"}
              </Button>
            </AnimatedButton>
          </div>
        </form>
      </Form>
    </FormAnimation>
  );
}
