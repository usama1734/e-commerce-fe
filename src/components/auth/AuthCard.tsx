import { Box, Button, Center, Heading, IconButton, Input, InputGroup, InputRightElement, Spinner, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

type AuthForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  addressLine: string;
  password: string;
  logo: File | null;
};

type AuthCardProps = {
  type: "login" | "signup";
  form: AuthForm;
  setForm: Dispatch<SetStateAction<AuthForm>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isAuthLoading: boolean;
};

export function AuthCard({ type, form, setForm, onSubmit, isAuthLoading }: AuthCardProps) {
  const isSignup = type === "signup";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Center minH="75vh">
      <Box
        w="full"
        maxW="480px"
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="3xl"
        p={{ base: "6", md: "8" }}
        backdropFilter="blur(10px)"
        boxShadow="0 16px 42px rgba(15, 23, 42, 0.10)"
      >
        <Text
          fontSize="xs"
          fontWeight="700"
          color="brand.600"
          bg="brand.50"
          display="inline-block"
          px="3"
          py="1"
          borderRadius="full"
          mb="3"
          letterSpacing="widest"
          textTransform="uppercase"
        >
          Account
        </Text>
        <Heading size="md" mb="2" letterSpacing="tight">
          {isSignup ? "Create Account" : "Welcome Back"}
        </Heading>
        <Text color="gray.600" mb="5">
          {isSignup ? "Create your profile to place orders." : "Login to continue."}
        </Text>
        <Box as="form" onSubmit={onSubmit}>
          <Stack spacing="3">
          {isSignup ? (
            <>
              <Input
                placeholder="First name"
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              />
              <Input
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              />
              <Input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
              <Input
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              />
              <Input
                placeholder="Address"
                value={form.addressLine}
                onChange={(e) => setForm((p) => ({ ...p, addressLine: e.target.value }))}
              />
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((p) => ({ ...p, logo: e.target.files?.[0] || null }))}
              />
            </>
          ) : null}
          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
          <InputGroup>
            <Input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? "Hide password" : "Show password"}
                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                size="sm"
                variant="ghost"
                onClick={() => setShowPassword((prev) => !prev)}
              />
            </InputRightElement>
          </InputGroup>
            <Button type="submit" isDisabled={isAuthLoading} h="46px">
              {isAuthLoading ? <Spinner size="sm" /> : isSignup ? "Create Account" : "Login"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Center>
  );
}
