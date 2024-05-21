import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useUserStore } from '../store/user';


export default () => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const { addNewSite } = useUserStore()

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const valid = form.checkValidity()

        const formData = new FormData(form)
        const submissionObject: {
            email?: string,
            password?: string
        } = {}
        formData.forEach((value: string, key: string) => submissionObject[key] = value);

        addNewSite(submissionObject)
    }

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Add New Site
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Site</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={onSubmit}>
                        <Form.Group className="mb-3" controlId="siteName">
                            <Form.Label>Site Name</Form.Label>
                            <Form.Control type="text" placeholder="Name" name='name' />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}