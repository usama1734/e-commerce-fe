import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";

type ConfirmActionModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isConfirmLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmActionModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  isConfirmLoading = false,
  onCancel,
  onConfirm,
}: ConfirmActionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} isCentered>
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="2xl" borderWidth="1px" borderColor="gray.200" mx="3">
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <Text color="gray.600">{description}</Text>
        </ModalBody>
        <ModalFooter gap="3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} isLoading={isConfirmLoading} loadingText="Please wait">
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
