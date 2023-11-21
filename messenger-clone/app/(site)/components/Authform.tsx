'use client';

import { useState, useCallback, useEffect } from "react";
import { FieldValues, useForm, SubmitHandler } from "react-hook-form";
import { BsGithub, BsGoogle } from 'react-icons/bs';
import { toast } from "react-hot-toast";
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";

import Input from "@/app/components/Inputs/Input";
import Button from "@/app/components/Button";
import AuthSocialButton from "./AuthSocialButton";
import axios from "axios";


type Variant = 'LOGIN' | 'REGISTER';

const AuthForm = () => {

    const [variant, setVariant] = useState<Variant>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);

    const session = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session?.status === 'authenticated') {
            router.push('/users');
        }
    }, [session?.status, router]);

    const toggleVariant = useCallback(() => {
        if (variant === 'LOGIN') {
            setVariant('REGISTER');
        }
        else {
            setVariant('LOGIN');
        }
    }, [variant]);

    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    });

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setIsLoading(true);

        if (variant === 'REGISTER') {
            try {
                await axios.post('/api/register', data);
                signIn('credentials', data);
            } catch (error) {
                toast.error("Something went wrong!");
            } finally {
                setIsLoading(false);
            }
        }

        if (variant === 'LOGIN') {
            try {
                const callback = await signIn('credentials', {
                    ...data,
                    redirect: false
                });

                if (callback?.error) {
                    toast.error('Invalid credentials!');
                } else if (callback?.ok) {
                    toast.success('Logged in!');
                    router.push('/users');
                }
            } catch (err) {
                toast.error("Something went wrong while loggin in!");
            } finally {
                setIsLoading(false);
            }
        }
    }

    const socialAction = async (action: string) => {
        setIsLoading(true);
        try {

            // NextAuth Social Sign In
            const callback = await signIn(action, {
                redirect: false
            });

            if (callback?.error) {
                toast.error("Invalid Credentials!");
            }
            else if (callback?.ok) {
                toast.success("Logged in!");
            }
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className=" bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
                <form
                    className="space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {variant === 'REGISTER' && (
                        <Input
                            id='name'
                            label="Name"
                            register={register}
                            errors={errors}
                            disabled={isLoading}
                        />
                    )}

                    <Input
                        id='email'
                        label="Email"
                        type="email"
                        register={register}
                        errors={errors}
                        disabled={isLoading}
                    />

                    <Input
                        id='password'
                        label="Password"
                        type="password"
                        register={register}
                        errors={errors}
                        disabled={isLoading}
                    />

                    <div>
                        <Button
                            disabled={isLoading}
                            fullWidth
                            type="submit"
                        >
                            {variant === 'LOGIN' ? 'Sign in' : 'Register'}
                        </Button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">

                        {/* Separating Line Below Button */}
                        <div className="
                        absolute
                        inset-0
                        flex
                        items-center
                        ">
                            <div className="w-full border-t border-gray-300" />
                        </div>

                        {/* Continue with infront of the line */}
                        <div className="
                        relative
                        flex 
                        justify-center
                        text-sm">
                            <span className="
                            bg-white
                            px-2
                            text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <AuthSocialButton
                            icon={BsGithub}
                            onClick={() => socialAction('github')}
                        />

                        <AuthSocialButton
                            icon={BsGoogle}
                            onClick={() => socialAction('google')}
                        />
                    </div>
                </div>

                <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
                    <div>
                        {variant === 'LOGIN' ? 'New to Messenger?' : 'Already have an account?'}
                    </div>
                    <div onClick={toggleVariant}
                        className="underline cursor-pointer"
                    >
                        {variant === 'LOGIN' ? 'Create an account' : 'Login'}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthForm;