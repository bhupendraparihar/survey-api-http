import React, {Component} from 'react';
import { connect } from 'react-redux';
require('../polls/pollspanel.css');
import ChatItem from '../chatitem/chatitem';


class PollsPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentmessage: '',
            appColor : ['#836ac7', '#4887bc', '#c64457', '#ffcf77', '#7e858b', '#6ad277', '#7bbc9b', '#80d9eb', '#fd9aa5', '#e2a966', '#de6646', '#8296f8'],
            colorcount : 0,
            colormap : {}
        }

        this.onTextChange = this.onTextChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.getColorCode = this.getColorCode.bind(this);
	}

	componentDidMount() {
        jQuery('.conferenceroom').hide();
        var config = {
            isPresenter: true,
            presenter_id: "123456",
            meeting_id: "12345R",
        }
        pollOrganizer.init(config)
	}

  	componentWillUnmount() {
  		
  	}

    onTextChange(event) {
       
    }

    getColorCode(sendername) {
        
    }

    handleKeyPress(ev) {
        if(ev.key === 'Enter') {
            this.props.onSendMessage('chat', this.state.currentmessage);
            this.props.AddChatMessage({
                message: this.state.currentmessage,
                sender : this.props.username,
                type : 'history'
            });
            this.setState({
                currentmessage: ''
            });
            
            ev.preventDefault();
            ev.stopPropagation();
        }
    }
    render() {
        const { messages } = this.props;
        return (
            <div className="chatpanelLayer">
                <section id="poll-list-app">
                    <div className="poll-list" id="pollListSection">
                        <div className="create-new-button">
                            <span className="btn btn-default create-new-btn" onClick={pollOrganizer.createNewPoll} value="New">Create New</span>
                        </div>
                        <table id="pollListEntries" className="table"></table>
                    </div>
                        <div className="create-poll" id="createPollSection">
                            <div className="poll-header">Create New Poll</div>
                            <div className="poll-statement">
                                <textarea name="pollStatement" id="pollStatement" cols="30" rows="10" placeholder="Type poll statement"></textarea>
                            </div>
                            <div className="poll-options">
                                <div>Option 1:<input type="text" placeholder="Provide options"/></div>
                                <div>Option 2:<input type="text" placeholder="Provide options"/></div>
                            </div>
                            <div className="submit-poll">
                                <span className="btn btn-default" onClick={pollOrganizer.submitNewPoll}>Submit</span>
                                <span className="btn btn-default" onClick={pollOrganizer.cancelNewPoll}>Cancel</span>
                            </div>
                        </div>
                        <div className="show-poll" id="showPollSection">
                            <div className="poll-header">Poll Details</div>
                            <div className="poll-statement"></div>
                            <div className="poll-options">
                                <ul>
                                    <li></li>
                                    <li></li>
                                </ul>
                            </div>
                            <div className="submit-poll">
                                <span className="end-poll btn btn-default" id="endPollButton" onClick={pollOrganizer.endPoll}>End Poll</span>
                                <span className="btn btn-default" onClick={pollOrganizer.showPollList}>Back</span>
                            </div>
                            <div className="poll-result" id="pollResult"></div>
                    </div>
                    <div className="poll-viewer" id="pollViewer">
                        <div>
                            <label className = "poll-question" id ="pollQuestion">Question</label>
                        </div>
                        <div className="poll-options">
                            <div>
                                <input type="radio" name = "pollOption" id ="pollOption1" className = "poll-option1" value ="Yes"/>
                                <label id ="lblOption1" className="option-text"></label>
                            </div>
                            <div>
                                <input type="radio" name = "pollOption" id ="pollOption2" className = "poll-option2" value="No"/>
                                <label id ="lblOption2" className="option-text"></label>
                            </div>
                        </div>                
                        <div>
                            <input type="button" value="Save"   className="submit-poll" id ="btnSubmit" />
                        </div>
                    </div>
                </section>                
            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        
    };
}


const mapDispatchToProps = (dispatch) => ({
    AddChatMessage: (prop) => dispatch(AddChatMessage(prop))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(PollsPanel)