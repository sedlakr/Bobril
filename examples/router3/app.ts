/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
/// <reference path="../../src/bobril.promise.d.ts"/>

module RouterApp {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    var needLogin = true;
    function checkAuthorization(tr: IRouteTransition): (boolean | Thenable<IRouteTransition>) {
        if (needLogin) {
            // Faking calling API to check if logged in
            return new Promise((resolve,reject)=>{
                console.log("Faked call to check if logged in");
                setTimeout(()=>{
                    console.log("Ha! We are not logged in.");
                    resolve(b.createRedirectPush("login"));
                },1000);
            });
        }  else {
            return true;
        }
    }

    var Page1: IBobrilComponent = {
        id: "Page1",
        canActivate: checkAuthorization,
        init(ctx: any, me: IBobrilNode) {
            ctx.ticks = 0;
            ctx.timer = setInterval(() => { ctx.ticks++; b.invalidate(); }, 1000);
        },
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = [h("h3", "Page1"), h("p", "Ticks :" + ctx.ticks)];
        },
        destroy(ctx: any, me: IBobrilNode) {
            clearInterval(ctx.timer);
        }
    }

    interface IPageLoginCtx extends IBobrilCtx {
        loginInProgress: boolean;
    }

    var PageLogin: IBobrilComponent = {
        id: "PageLogin",
        init(ctx: IPageLoginCtx) {
            ctx.loginInProgress = false;
        },
        render(ctx: IPageLoginCtx, me: IBobrilNode) {
            me.tag = "div";
            me.children = [h("h3", "Please Login"), {
                tag: "button", attrs: { disabled: ctx.loginInProgress }, children: "Fake login", component: {
                    onClick: (ctx: IPageLoginCtx) => {
                        b.invalidate();
                        ctx.loginInProgress = true;
                        setTimeout(()=>{
                            needLogin = false;
                            ctx.loginInProgress = false;
                            var tr=b.createBackTransition();
                            if (!tr.inApp) {
                                tr = b.createRedirectReplace("root");
                            }
                            b.runTransition(tr);
                        }, 3000);
                    }
                }
            }];
        }
    }

    var App: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = [
                h("h1", "Router sample with login"),
                h("ul",
                    h("li", b.link(h("a", "Page 1 - needs to be logged in"), "page1")),
                    h("li", b.link(h("a", "Login"), "login"))),
                me.data.activeRouteHandler()
            ];
        }
    }

    b.routes(b.route({ name:"root", url:"/", handler: App }, [
        b.route({ name: "page1", handler: Page1 }),
        b.route({ name: "login", handler: PageLogin })
    ]));
}