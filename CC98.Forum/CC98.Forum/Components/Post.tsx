﻿import * as React from 'react';
import * as State from '../States/AppState';
import * as Utility from '../Utility';
import * as $ from 'jquery';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom';

import { match } from "react-router";
import { UbbContainer } from './UbbContainer';
import { SendTopic } from './SendTopic';
import * as moment from 'moment';
export class RouteComponent<TProps, TState, TMatch> extends React.Component<TProps, TState> {

    constructor(props?, context?) {
        super(props, context);
    }
    get match(): match<TMatch> {
        return (this.props as any).match;
    }
}

export class Post extends RouteComponent<{}, { topicid, page, totalPage, userName }, { topicid, page, userName }> {
    constructor(props, context) {
        super(props, context);
        this.state = { page: 1, topicid: this.match.params.topicid, totalPage: 1, userName: null };
    }
    async componentWillReceiveProps(newProps) {
        let page: number;
        if (!newProps.match.params.page) {
            page = 1;
        }
        else { page = parseInt(newProps.match.params.page); }
        const userName = newProps.match.params.userName;
        const totalPage = await this.getTotalPage(this.match.params.topicid);
        this.setState({ page: page, topicid: newProps.match.params.topicid, totalPage: totalPage, userName: userName });
    }
    async componentDidMount() {
        let page: number;
        if (!this.match.params.page) {
            page = 1;
        }
        else { page = parseInt(this.match.params.page); }
        const totalPage = await this.getTotalPage(this.match.params.topicid);
        const userName = this.match.params.userName;
        this.setState({ page: page, topicid: this.match.params.topicid, totalPage: totalPage, userName: userName });
    }
    async getTotalPage(topicid) {
        const replyCountResponse = await fetch(`http://api.cc98.org/Topic/${topicid}`);
        const replyCountJson = await replyCountResponse.json();
        const replyCount = replyCountJson.replyCount;
        if (replyCount > 10) {
            return (replyCount - replyCount % 10) / 10 + 1;
        } else {
            return 1;
        }
    }
    returnTopic() {
        return <PostTopic imgUrl="/images/ads.jpg" page={this.state.page} topicid={this.state.topicid} />;

    }
    render() {
        let topic = null;
        if (this.state.page == 1) {
            topic = <PostTopic imgUrl="/images/ads.jpg" page={this.state.page} topicid={this.state.topicid} />;
        }
        return <div className="center" style={{  minWidth: "1140px" }} >
            <TopicPager page={this.state.page} topicid={this.state.topicid} totalPage={this.state.totalPage} />
            {topic}
            <Route path="/topic/:topicid/:page?" component={Reply} />
            <TopicPagerDown page={this.state.page} topicid={this.state.topicid} totalPage={this.state.totalPage} />
            <SendTopic topicid={this.state.topicid} />
        </div>
            ;

    }

}
export class Reply extends RouteComponent<{}, { contents }, { page, topicid, userName }>{
    constructor(props, content) {
        super(props, content);
        this.state = {
            contents: [],
        };

    }

    async componentWillReceiveProps(newProps) {
        const page = newProps.match.params.page || 1;
        const realContents = await Utility.getTopicContent(newProps.match.params.topicid, page);
        console.log(realContents);
        this.setState({ contents: realContents });

    }
    private generateContents(item: State.ContentState) {
        return <div className="reply" ><div style={{ marginTop: "15px", marginBotton: "5px", border: "#EAEAEA solid thin" }}>
            <Replier key={item.id} userId={item.userId} topicid={item.topicId} userName={item.userName} replyTime={item.time} floor={item.floor} userImgUrl={item.userImgUrl} sendTopicNumber={item.sendTopicNumber} />
            <ReplyContent key={item.content} content={item.content} signature={item.signature} />
        </div>
        </div>;
    }
    render() {
        console.log("new");
        console.log(this.state.contents);
        return <div className="center" style={{ width: "1140px" }}>
            {this.state.contents.map(this.generateContents)}
        </div>
            ;
    }
}

export class Replier extends RouteComponent<{ userId, topicid, userName, replyTime, floor, userImgUrl, sendTopicNumber }, State.ReplierState, { topicid }>{
    constructor(props, content) {
        super(props, content);
        this.state = {
            imgUrl: "/images/authorImg.jpg",
            timeImgUrl: "/images/clock.jpg",
            userName: "VayneTian",
            replyTime: Date(),
            topicsNumber: 999,
            level: 2,
        }
    }
    render() {
        let url = `/user/${this.props.userId}`;
        let realUrl = encodeURIComponent(url);
        let curUserPostUrl = `/topic/${this.props.topicid}/user/${this.props.userName}`;
        $(document).ready(function () {
            $(".authorImg").mouseenter(function (event: JQuery.Event) {
                const currentImage = event.currentTarget;
                $(currentImage).next(".userDetails").show();
            });
            $(".mouse-userDetails").mouseleave(function (event: JQuery.Event) {
                const currentImage = event.currentTarget;
                $(currentImage).find(".userDetails").hide();
            });

        });
        let topicNumber = '帖数';
        if (!this.props.userId) {
            topicNumber = '';
        }
        let userDetails;
        if (this.props.userName != '匿名') {
         userDetails = <UserDetails userName={this.props.userName} />;
        } else {
             userDetails = null;
        }
    

        return <div className="replyRoot">
            <div className="row" style={{ width: "1140px", display: "flex", marginBottom: "10px" }}>

                <div className="row mouse-userDetails" style={{ height: "250px", width: "380px" }} >
                    <div className="authorImg" ><a href={realUrl}><img src={this.props.userImgUrl}></img></a></div>
                    <div className="userDetails" style={{ display: "none", position: "absolute", zindedx: "1" }}>
                        {userDetails}
                    </div>

                </div>
                <div className="column" id="rpymes" style={{ marginLeft: "-300px" }}>
                    <div className="row" id="replierMes">
                        <div style={{ marginLeft: "10px" }}><span>{this.props.floor}L</span></div>
                        <div className="rpyClr" style={{ marginLeft: "10px" }}><a href={url}>{this.props.userName}</a></div>
                        <div id="topicsNumber" style={{ marginLeft: "10px" }}>{topicNumber}   <span className="rpyClrodd">{this.props.sendTopicNumber}</span> </div>
                    </div>
                    <div className="row" >
                        <div id="clockimg" style={{ marginLeft: "6px" }}><i className="fa fa-clock-o fa-lg fa-fw"></i></div>
                        <div><span className="timeProp">{moment(this.props.replyTime).format('YYYY-MM-DD HH:mm:ss')}</span></div>
                    </div>
                </div>
                <div id="operation"  >
                    <button className="operation">引用</button>
                    <button className="operation">编辑</button>
                    <button className="operation">私信</button>
                    <button className="operation">举报</button>
                    <Link className="operation" to={curUserPostUrl}>只看此用户</Link>
                </div>
            </div></div>;
    }
}
export class UserDetails extends RouteComponent<{ userName }, { portraitUrl, userName }, {}>{
    constructor(props) {
        super(props);
        this.state = ({ portraitUrl: null, userName: null });
    }
    async componentDidMount() {
        if (this.props.userName != '匿名') {
            let url = `http://api.cc98.org/user/name/${this.props.userName}`;
            let message = await fetch(url);
            let data = await message.json();
            this.setState({ portraitUrl: data.portraitUrl, userName: data.name });
        }
    }
    render() {
        let url = `/user/name/${this.props.userName}`;
        let userUrl = encodeURIComponent(url);
        if (this.props.userName != '匿名') {
            return <div className='popup'>
                <div className='popup_title'>
                    <div className="row">
                        <div className="row authorImg" style={{ marginLeft: "10px", marginTop: "10px" }}>
                            <a href={userUrl}> <img src={this.state.portraitUrl}></img></a>
                        </div>
                        <div className="column" style={{ marginLeft: "25px", marginTop: "30px" }}>
                            <div className="row">
                                <div style={{ fontFamily: "微软雅黑", color: "blue", marginRight: "10px" }}> {this.state.userName}</div>   <div style={{ marginRight: "10px", fontSize: "14px" }}>   粉丝  </div><div style={{ color: "red", fontSize: "12px" }}>2333</div>
                            </div>
                            <div className="row" style={{ marginTop: "10px", fontSize: "14px" }}>
                                技术组组长
                        </div>
                        </div>
                        <div>
                            <button id="watch" style={{ width: "80px", backgroundColor: "#FF6A6A", marginRight: "10px", marginLeft: "25px", marginTop: "50px", height: "30px" }}>关注</button>
                        </div>
                    </div>

                </div>
            </div>;
        } else {
            return;
        }
    }
}
export class PostTopic extends RouteComponent<{ imgUrl, page, topicid }, State.PostTopicState, {}> {
    constructor(props, content) {
        super(props, content);
        this.state = {
            topicMessage: { title: "ss", time: "2017", content: "", signature: "" }
        }
    }
    async componentDidMount() {
        let topicMessage = await Utility.getTopic(this.props.topicid);
        this.setState({ topicMessage: topicMessage });
    }
    render() {
        return <div className="root">
            <div className="essay">
                <AuthorMessage authorId={this.state.topicMessage.userId} authorName={this.state.topicMessage.userName} authorImgUrl={this.state.topicMessage.userImgUrl} />
                <TopicTitle Title={this.state.topicMessage.title} Time={this.state.topicMessage.time} HitCount={this.state.topicMessage.hitCount} />
                <div id="ads"><img src={this.props.imgUrl}></img></div>
            </div>

            <TopicContent content={this.state.topicMessage.content} signature={this.state.topicMessage.signature} />
            <TopicGood />
            <TopicVote />
        </div>;
    }
}


export class AuthorMessage extends RouteComponent<{ authorName: string, authorId: number, authorImgUrl: string }, State.AuthorMessageState, {}> {
    constructor(props, content) {
        super(props, content);
        this.state = {
            userName: 'Mana',
            fansNumber: 233,
            imgUrl: this.props.authorImgUrl
        };
    }
    render() {
        const url = `/user/${this.props.authorId}`;
        return <div className="row" id="authormes">

            <div className="authorImg" ><a href={url}><img src={this.props.authorImgUrl}></img></a></div>
            <div className="column" style={{ marginLeft: "20px" }}>
                <div className="row authorFans" style={{ justifyContent: "space-between" }}>
                    <div id="authorName"><p><a href={url}>{this.props.authorName}</a></p></div>
                    <div id="fans" className="row"><div style={{ marginRight: "3px" }}>粉丝</div><div style={{ color: "#EE0000" }}>{this.state.fansNumber}</div></div>
                </div>

                <div className="row">
                    <button id="watch">关注</button>
                    <button id="email">私信</button>
                </div>
            </div>
        </div>;
    }
}
export class TopicTitle extends RouteComponent<{ Title, Time, HitCount }, State.TopicTitleState, {}> {
    constructor(props, content) {
        super(props, content);
        this.state = {
            isNotice: true,
            isTop: true,
            title: "这是一个长长啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊的标题",
            tag: "女装/开车",
            time: "2017.8.12",
            likeNumber: 666,
            unlikeNumber: 233,
            viewTimes: 2366
        }
    }
    returnProps(isTop, isNotice, title) {
        if (isTop == true && isNotice == false) {
            return <div id="title1" className="row" style={{ justifyContent: "flex-start" }}>
        
                <div id="essayTitle">{title}</div>
            </div>;
        } else if (isTop == false && isNotice == true) {
            return <div id="title1" className="row" style={{ justifyContent: "flex-start" }}>
         
                <div id="essayTitle">{title}</div>
            </div>;
        } else if (isTop == true && isNotice == true) {
            return <div id="title1" className="row" style={{ justifyContent: "flex-start" }}>

                <div id="essayTitle">{title}</div>
            </div>;
        } else {
            return <div id="title1" className="row" style={{ justifyContent: "flex-start" }}>
                <div id="essayTitle">{title}</div>
            </div>;
        }
    }
    render() {
        return <div id="title">
            <div className="column" id="topicTitleProp" >
                <div id="essay1" className="row">
                    {this.returnProps(this.state.isTop, this.state.isNotice, this.props.Title)}

                </div>
                <div className="row" id="essayProp">
                    <div id="tags"><span className="tagProp tagSize">标签： {this.state.tag}</span><span className="tagProp"></span></div>
                    <div id="time"><span className="viewProp"><i className="fa fa-clock-o fa-lg fa-fw"></i></span> <span className="timeProp tagSize">{moment(this.props.Time).format('YYYY-MM-DD HH:mm:ss')}</span></div>
                    <div id="viewtimes"><span className="viewProp"><i className="fa fa-eye fa-lg fa-fw"></i>  </span> <span className="timeProp tagSize">{this.props.HitCount}次</span></div>
                </div>
            </div>
       
        </div>;
    }
}
export class TopicContent extends RouteComponent<{ content: string, signature: string }, { likeNumber: number, dislikeNumber: number }, {}> {
    constructor(props, content) {
        super(props, content);
        this.state = {
            likeNumber: 666,
            dislikeNumber: 233,
        }
    }
    //<div className="signature">{this.state.Signature}</div>
    render() {
        return <div className="content">
            <div className="substance"><UbbContainer code={this.props.content} /> </div>
            <div className="signature"><UbbContainer code={this.props.signature} /></div>
            <div className="comment">
                <div id="commentlike" className="buttonFont"><button className="commentbutton"><i className="fa fa-star-o fa-lg"></i></button>   收藏文章 </div>
                <div id="commentliked"><i className="fa fa-thumbs-o-up fa-lg"></i><span className="commentProp"> {this.state.likeNumber}</span></div>
                <div id="commentunliked"><i className="fa fa-thumbs-o-down fa-lg"></i><span className="commentProp"> {this.state.dislikeNumber}</span></div>
                <div id="commentlike" className="buttonFont row"> <div className="commentbutton">   评分</div><div className="commentbutton">   编辑</div></div>
            </div>
        </div>;
    }
}
export class ReplyContent extends RouteComponent<{ content, signature }, { likeNumber, dislikeNumber }, {}> {
    constructor(props, content) {
        super(props, content);
        this.state = {
            likeNumber: 2424,
            dislikeNumber: 4433,

        }
    }
    //content: "央视网消息：7月26日至27日，习近平在省部级主要领导干部专题研讨班开班式上强调，党的十八大以来的5年，是党和国家发展进程中很不平凡的5年。我们加强党对意识形态工作的领导，巩固了全党全社会思想上的团结统一。党的十八大以来，面对意识形态领域日益错综复杂的形势，习总书记发表了一系列重要讲话，深刻阐述了意识形态工作的重大理论和现实问题。本图解梳理了相关重要论述以及十八大以来各领域工作成绩，以飨读者。</p><p>央视网消息：7月26日至27日，习近平在省部级主要领导干部专题研讨班开班式上强调，党的十八大以来的5年，是党和国家发展进程中很不平凡的5年。我们加强党对意识形态工作的领导，巩固了全党全社会思想上的团结统一。党的十八大以来，面对意识形态领域日益错综复杂的形势，习总书记发表了一系列重要讲话，深刻阐述了意识形态工作的重大理论和现实问题。本图解梳理了相关重要论述以及十八大以来各领域工作成绩，以飨读者。",
    //
    render() {
        return <div className="root" style={{ marginTop: "-170px" }}>
            <div className="reply-content">
                <div className="substance"><UbbContainer code={this.props.content} /></div>
                <div className="signature"><UbbContainer code={this.props.signature} /></div>
                <div className="comment">

                    <div id="commentliked"><i className="fa fa-thumbs-o-up fa-lg"></i><span className="commentProp"> {this.state.likeNumber}</span></div>
                    <div id="commentunliked"><i className="fa fa-thumbs-o-down fa-lg"></i><span className="commentProp"> {this.state.dislikeNumber}</span></div>
                    <div id="commentlike"> <div className="commentbutton">   评分</div></div>
                </div>
            </div></div>;
    }
}
export class TopicGood extends RouteComponent<{}, State.TopicGoodState, {}> {
    constructor(props, content) {
        super(props, content);
        this.state = {
            userName: "Mana",
            grade: 10,
            reward: 20,
            credit: "6666炒鸡赞",
            imgUrl: "/images/authorImg.jpg"
        }
    }
    render() {
        return <div className="good tagSize" >
            <div id="userImage"><img src={this.state.imgUrl} ></img> </div>
            <div id="userName"><span>{this.state.userName}</span></div>
            <div id="grades"><span>评分 </span><span id="grade">+{this.state.grade}</span></div>
            <div id="reward"><span>赏金 </span><span id="money">{this.state.reward}</span><span>论坛币</span></div>
            <div id="credit"><span>{this.state.credit}</span></div>
        </div>;
    }
}

export class TopicVote extends RouteComponent<{}, State.TopicVoteState, {}> {
    constructor(props, content) {
        super(props, content);
        this.state = {
            option: "我认为他说的很对",
            votes: 60,
            totalVotes: 220,
            voted: false,
        }
    }
    render() {
        return <div className="vote" >
            <div className="row"><input id="checkbox" type="checkbox" /> <span id="option1" style={{ marginLeft: "15px" }}>{this.state.option} </span></div>
            <div className="row">
                <div className="progress">
                    <div className="voteResult"></div>
                </div>
                <span style={{ marginLeft: "15px" }}>{this.state.votes}</span>
                <span> ({this.state.votes / this.state.totalVotes * 100}%)</span>
            </div>
            <div style={{ marginLeft: "20px" }}>{this.state.voted ? <span>你已经投过票啦</span> : <button className="operation">投票</button>}</div>
        </div>;
    }
}
export class TopicPager extends RouteComponent<{ page, topicid, totalPage }, { pager }, {}> {
    constructor(props, content) {
        super(props, content);
        this.state = {
            pager: [1, 2, 3, 4, 5]
        };
    }
	/**
	 * 将页码转换为 UI 界面。
	 * @param pageNumber 要转换的页码。
	 * @returns {JSX.Element} 页码对应的 UI 元素。
	 */


    generatePageLink(pageNumber: number) {

        return <PageModel pageNumber={pageNumber} topicid={this.props.topicid} curPage={this.props.page} totalPage={this.props.totalPage} />;
    }
    async componentWillReceiveProps(newProps) {
        const pages = Utility.getPager(newProps.page, newProps.totalPage);
        console.log('new=' + pages);
        this.setState({ pager: pages });
    }
    async componentDidMount() {
        const pages = Utility.getPager(this.props.page, this.props.totalPage);
        this.setState({ pager: pages });
    } t
    render() {
        return <div className="row" style={{ minWidth: '1140px', height: '50px', marginTop: '15px', justifyContent: 'space-between', borderBottom: ' #EAEAEA solid thin', alignItems: 'flex-end', flexDirection: "row-reverse" }}>
            <div id="pager" >
                <div className="row pagination">{this.state.pager.map(this.generatePageLink.bind(this))}</div>
            </div>
        </div>;
    }
}
export class TopicPagerDown extends RouteComponent<{ page, topicid, totalPage }, { pager }, {}> {
    constructor(props, content) {
        super(props, content);
        this.state = {
            pager: [1, 2, 3, 4, 5]
        };
    }
	/**
	 * 将页码转换为 UI 界面。
	 * @param pageNumber 要转换的页码。
	 * @returns {JSX.Element} 页码对应的 UI 元素。
	 */


    generatePageLink(pageNumber: number) {

        return <PageModel pageNumber={pageNumber} topicid={this.props.topicid} curPage={this.props.page} totalPage={this.props.totalPage} />;
    }
    async componentWillReceiveProps(newProps) {
        const pages = Utility.getPager(newProps.page, newProps.totalPage);
        console.log('new=' + pages);
        this.setState({ pager: pages });
    }
    async componentDidMount() {
        const pages = Utility.getPager(this.props.page, this.props.totalPage);
        this.setState({ pager: pages });
    } t
    render() {
        return <div className="row" style={{ width: '1140px', height: '50px', marginTop: '35px', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div id="pager" >
                <div className="row pagination">{this.state.pager.map(this.generatePageLink.bind(this))}</div>
            </div>
        </div>;
    }
}
export class PageModel extends React.Component<{ pageNumber, topicid, curPage, totalPage }, {}> {

    render() {
        let pageUrl: string;
        if (this.props.pageNumber > 0) {
            pageUrl = `/topic/${this.props.topicid}/${this.props.pageNumber}`;
            if (this.props.pageNumber != this.props.curPage) {
                return <li className="page-item"><Link className="page-link" to={pageUrl}>{this.props.pageNumber}</Link></li>;
            } else {
                return <li className="page-item active"><Link className="page-link" to={pageUrl}>{this.props.pageNumber}</Link></li>;

            }

        } else if (this.props.pageNumber == -1) {
            pageUrl = `/topic/${this.props.topicid}/${this.props.curPage - 1}`;
            const last = '<';
            return <li className="page-item"><Link className="page-link" to={pageUrl}>{last}</Link></li>
                ;
        } else if (this.props.pageNumber == -2) {
            pageUrl = `/topic/${this.props.topicid}/${this.props.curPage + 1}`;
            const next = '>';
            return <li className="page-item"><Link className="page-link" to={pageUrl}>{next}</Link></li>
                ;
        } else if (this.props.pageNumber == -3) {
            pageUrl = `/topic/${this.props.topicid}/1`;
            const start = '<<';
            return <li className="page-item"><Link className="page-link" to={pageUrl}>{start}</Link></li>
                ;
        } else {
            pageUrl = `/topic/${this.props.topicid}/${this.props.totalPage}`;
            const end = '>>';
            return <li className="page-item"><Link className="page-link" to={pageUrl}>{end}</Link></li>
                ;
        }
    }
}
export class UserMessageBox extends React.Component<{ userName, userFans }, {}>{
    render() {
        return <div id="userMessageBox">{this.props.userName}</div>;
    }
}