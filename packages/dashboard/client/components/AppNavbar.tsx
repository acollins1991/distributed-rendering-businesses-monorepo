import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { useUserStore } from '../store/user';
import { useState } from 'react';

function BasicExample() {

    const { signoutUser } = useUserStore()

    const [loggingOut, setLoggingOut] = useState(false)
    async function onLogoutButtonClick() {
        setLoggingOut(true)
        signoutUser().then(() => window.location.href = '/login')
        setLoggingOut(false)
    }

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="/">React-Bootstrap</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/">Home</Nav.Link>
                        <Button variant="danger" onClick={onLogoutButtonClick} disabled={loggingOut}>Logout</Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default BasicExample;