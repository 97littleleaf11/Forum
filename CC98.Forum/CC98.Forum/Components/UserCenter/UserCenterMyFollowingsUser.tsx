﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from 'react';
import { UserFanInfo } from '../../States/AppState';
import * as Utility from '../../Utility';

//用户中心我的关注&我的粉丝用户通用组件
export class UserCenterMyFollowingsUser extends React.Component<UserCenterMyFollowingsUserProps, UserCenterMyFollowingsUserState> {
    constructor(props) {
        super(props);
        this.state = {
            buttonInfo: '已关注',
            buttonIsDisabled: false,
            isFollowing: true
        }
        this.unfollow = this.unfollow.bind(this);
        this.follow = this.follow.bind(this);
    }

    async unfollow() {
        this.setState({
            buttonIsDisabled: true,
            buttonInfo: '取关中'
        });
        let res = Utility.unfollowUser(this.props.userFanInfo.id);
        if (res) {
            this.setState({
                buttonIsDisabled: false,
                buttonInfo: '重新关注',
                isFollowing: false
            });
        } else {
            this.setState({
                buttonIsDisabled: false,
                buttonInfo: '取关失败',
                isFollowing: true
            });
        }
    }

    async follow() {
        this.setState({
            buttonIsDisabled: true,
            buttonInfo: '关注中'
        });
        let res = await Utility.followUser(this.props.userFanInfo.id);
        if (res) {
            this.setState({
                buttonIsDisabled: false,
                buttonInfo: '已关注',
                isFollowing: true
            });
        } else {
            this.setState({
                buttonIsDisabled: false,
                buttonInfo: '关注失败',
                isFollowing: false
            });
        }
    }

    render() {
        return (
            <div className="user-center-myfollowings-user">
                <img src={this.props.userFanInfo.avatarImgURL} />
                <p>
                    <span className="user-center-myfollowings-user-id"><a href={`/user/${this.props.userFanInfo.id}`}>{this.props.userFanInfo.name}</a></span>
                    主题
                    <span className="user-center-myfollowings-user-posts">{this.props.userFanInfo.posts}</span>
                    粉丝
                    <span className="user-center-myfollowings-user-fans">{this.props.userFanInfo.fans}</span>
                </p>
                <button
                    type="button"
                    id={this.state.isFollowing ? '' : 'follow'}
                    onMouseOver={() => {
                        if (this.state.isFollowing && !this.state.buttonIsDisabled) {
                            this.setState({
                                buttonInfo: '取消关注'
                            });
                        }
                    }}
                    onMouseLeave={() => {
                        if (this.state.isFollowing && !this.state.buttonIsDisabled) {
                            this.setState({
                                buttonInfo: '已关注'
                            });
                        }
                    }}
                    onClick={this.state.isFollowing ? this.unfollow : this.follow}
                    disabled={this.state.buttonIsDisabled}>{this.state.buttonInfo}
                </button>
            </div>
        );
    }
}

interface UserCenterMyFollowingsUserProps {
    userFanInfo: UserFanInfo;
}

interface UserCenterMyFollowingsUserState {
    buttonIsDisabled: boolean;
    buttonInfo: string;
    isFollowing: boolean;
}