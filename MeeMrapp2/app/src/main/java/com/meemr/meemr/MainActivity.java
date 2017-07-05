package com.meemr.meemr;

import android.content.Context;
import android.support.v4.app.Fragment;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.ActionBar;
import android.view.KeyEvent;
import android.view.View;
import android.support.design.widget.NavigationView;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.Menu;
import android.view.MenuItem;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import static com.meemr.meemr.R.drawable.ic_login;
import static com.meemr.meemr.R.drawable.ic_logout;

public class MainActivity extends AppCompatActivity
        implements NavigationView.OnNavigationItemSelectedListener {

    private String token = "";
    private String type = "recent";
    private boolean loggedin = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawer.setDrawerListener(toggle);
        toggle.syncState();

        FragmentTransaction tx = getSupportFragmentManager().beginTransaction();
        tx.replace(R.id.content_frame, new RecentActivity());
        tx.commit();

        NavigationView navigationView = (NavigationView) findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);

    }

    @Override
    public void onBackPressed() {
        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);

        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();


        switch (item.getItemId()) {
            case R.id.hot_switch:
            case R.id.pref_switch:
            case R.id.recent_switch:
                if (item.isChecked()) item.setChecked(false);
                else item.setChecked(true);
                type=item.getTitle().toString().toLowerCase();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }


    @SuppressWarnings("StatementWithEmptyBody")
    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        // Handle navigation view item clicks here.
        int id = item.getItemId();

        Fragment fragment = null;

        //initializing the fragment object which is selected
        switch (id) {
            case R.id.nav_recent:
                fragment = new RecentActivity();
                break;
            case R.id.nav_register:
                fragment = new RegisterActivity();
                break;
            case R.id.nav_surprise:
                fragment = new RandomActivity();
                break;
            case R.id.nav_login:
                if(!loggedin){
                fragment = new LoginActivity();
                }
                else{
                    loggedin=false;
                    initSession();
                    Snackbar.make(findViewById(R.id.memeview), "Logged out", Snackbar.LENGTH_SHORT)
                            .setAction("Action", null).show();
                    item.setTitle("Log in");
                    item.setIcon(R.drawable.ic_login);
                    TextView navheader = (TextView) findViewById(R.id.navheadertext);
                    navheader.setText("Howdy, stranger.");
                    FragmentTransaction tx = getSupportFragmentManager().beginTransaction();
                    tx.replace(R.id.content_frame, new RecentActivity());
                    tx.commit();
                }
                break;

        }

        //replacing the fragment
        if (fragment != null) {
            FragmentTransaction ft = getSupportFragmentManager().beginTransaction();
            ft.replace(R.id.content_frame, fragment);
            ft.commit();
        }

        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }

    public void initSession(){
        RequestQueue requestQueue = Volley.newRequestQueue(this);
        String url = "http://10.0.2.2:3000/user/session";
        JsonObjectRequest getRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                new Response.Listener<JSONObject>()
                {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            setToken(response.getString("token"));
                            token=response.getString("token");
                            System.out.println("HIER IS DE GVD TOKEN:"+token);
                        } catch (JSONException e){
                            e.printStackTrace();
                        }
                    }
                },
                new Response.ErrorListener()
                {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        VolleyLog.e("Error: ", error.getMessage());
                    }
                }
        );

// add it to the RequestQueue
        requestQueue.add(getRequest);
    }
    public void setToken(String loginToken){
        token = loginToken;
    }

    public String getToken(){
        return token;
    }

    public String getType() { return type;}
    public void setType(String whatType) { type=whatType;}
    public boolean isLoggedin(){return loggedin;};
    public void setLoggedin(boolean status){loggedin=status;}
}
