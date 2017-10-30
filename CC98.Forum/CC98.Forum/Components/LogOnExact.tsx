﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from 'react';
import * as $ from 'jquery';
import * as Utility from '../Utility';

export class LogOnExact extends React.Component<null, LogOnState> {
    constructor(props) {
        super(props);
        this.state = {
            loginName: '',
            loginPassword: '',
            loginMessage: '',
            isLogining: false
        };

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
    }

    shake(element: HTMLElement) {
        element.classList.add('shake');
        setTimeout(() => { element.classList.remove('shake') }, 500);
        return element;
    }

    handleNameChange(e) {
        this.setState({
            loginName: e.target.value
        });
    }

    handlePasswordChange(e) {
        this.setState({
            loginPassword: e.target.value
        });
    }

    async handleLogin(e) {
        //阻止表单提交
        e.preventDefault();

        //如果在登陆中则无视提交
        if (this.state.isLogining) {
            return false;
        }

        //缺少用户名或者密码
        if (!this.state.loginName) {
            this.setState({
                loginMessage: '请输入用户名'
            });
            this.shake(document.getElementById('loginName')).focus();

            return false;
        } else if (!this.state.loginPassword) {
            this.setState({
                loginMessage: '请输入密码'
            });
            this.shake(document.getElementById('loginPassword')).focus();

            return false;
        }

        //登陆
        this.setState({
            loginMessage: '登陆中',
            isLogining: true
        });

        let url = 'http://openid.cc98.org/connect/token';

        /*
        请求的正文部分，密码模式需要5个参数，其中client_id和client_secret来自申请的应用，grant_type值固定为"password"
        */
        const requestBody = {
            'client_id': '9a1fd200-8687-44b1-4c20-08d50a96e5cd',
            'client_secret': '8b53f727-08e2-4509-8857-e34bf92b27f2',
            'grant_type': 'password',
            'username': this.state.loginName,
            'password': this.state.loginPassword
        }

        let response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',//在fetch API里这不是默认值，需要手动添加
            },
            body: $.param(requestBody)

        });

        //请求是否成功
        if (response.status !== 200) {
            this.setState({
                loginMessage: `登陆失败 ${response.status}`,
                isLogining: false
            });
            return false;
        }

        let data = await response.json();
        const token = "Bearer " + encodeURIComponent(data.access_token);
        console.log("after logon token=" + token);

        //缓存token
        Utility.setLocalStorage("accessToken", token);
        Utility.setLocalStorage("userName", this.state.loginName);

        this.setState({
            loginMessage: '登陆成功 正在返回首页',
            isLogining: false
        });

        //跳转至个人中心页
        setTimeout(() => {
            location.pathname = "/";
        }, 2000); 

    } catch(e) {    //捕捉到例外，开始执行catch语句，否则跳过
        //alert(e.error);     这行好像没什么用……暂时还不会处理不同的error……
        console.log("Oops, error", e);
        this.setState({
            loginMessage: `登陆失败`,
            isLogining: false
        });
    }

    render() {
        return (
            <div className="login">
                <div>
                    <img src="/images/login.png" />
                    <div>
                        <img src="/images/login_welcome.png" />
                        <form onSubmit={this.handleLogin}>
                            <div className="login-form">
                                <p>用户名</p><input type="text" id="loginName" onChange={this.handleNameChange} value={this.state.loginName} />
                            </div>
                            <div className="login-form">
                                <p>密码</p><input type="password" id="loginPassword" onChange={this.handlePasswordChange} />
                            </div>
                            <p id="loginMessage">{this.state.loginMessage}</p>
                            <button type="submit" disabled={this.state.isLogining}>登陆账号</button>
                        </form>
                        <p><span>还没账号？我要 <a href="">注册</a></span></p>
                    </div>
                </div>
            </div>
        );
    }
}

/**
 * 登陆页状态
 */
class LogOnState {
    /**
    * 用户名
    */
    loginName: string;
    /**
    * 密码
    */
    loginPassword: string;
    /**
    * 登陆信息
    */
    loginMessage: string;
    /**
    * 登陆状态
    */
    isLogining: boolean;
}