import { Button } from "@material-ui/core"
import { Component } from "react"
import firebase from 'firebase/app'
import { withRouter } from "react-router";

class GuestLinks extends Component {

    constructor(props){
        super(props)
        this.state = {
            isAuthenticated: false,
            user: null
        }
    }

    render() {
        return (

            <div className='sectionDesktop navButtons'>
                <Button component="a" href='/' >
                    Home
                </Button>
                <Button component="a" href='/ourstory'>
                    Our Story
                </Button>
            </div>
        )
    }

}
export default withRouter(GuestLinks);