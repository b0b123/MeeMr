package com.meemr.meemr;

import android.app.Activity;
import android.content.Context;
import android.support.design.widget.NavigationView;
import android.support.v4.app.Fragment;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RemoteViews;
import android.widget.TextView;

import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;

/**
 * Created by stefa on 27-6-2017.
 */

public class LoginActivity extends Fragment {
    String token = "";
    EditText userInput;
    EditText passInput;
    TextView statusText;
    TextView navheader;
    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.content_login, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        Button button = (Button) view.findViewById(R.id.loginButton);
        button.setOnClickListener(new View.OnClickListener()
        {
            @Override
            public void onClick(View v)
            {
                userInput=(EditText) getView().findViewById(R.id.userInput);
                passInput=(EditText) getView().findViewById(R.id.passInput);
                statusText=(TextView) getView().findViewById(R.id.statusText);


                RequestQueue requestQueue = Volley.newRequestQueue(getActivity());
                final String URL = "http://10.0.2.2:3000/user/login";
                // Post params to be sent to the server
                HashMap<String, String> params = new HashMap<String, String>();
                params.put("name", userInput.getText().toString());
                params.put("pass", passInput.getText().toString());

                JsonObjectRequest req = new JsonObjectRequest(URL, new JSONObject(params),
                        new Response.Listener<JSONObject>() {
                            @Override
                            public void onResponse(JSONObject response) {
                                try {
                                    VolleyLog.v("Response:%n %s", response.toString(4));
                                    token = response.getString("token");
                                    System.out.println(token);
                                    ((MainActivity) getActivity()).setToken(token);
                                    NavigationView navigationView = getActivity().findViewById(R.id.nav_view);
                                    System.out.println("hier moet navigation view komen" + navigationView);
                                    Menu menu = navigationView.getMenu();
                                    MenuItem menuItem = menu.findItem(R.id.nav_login);
                                    System.out.println("hier moet login komen: " + menuItem);
                                    menuItem.setTitle("Log out");
                                    navheader = getActivity().findViewById(R.id.navheadertext);
                                    navheader.setText("Howdy, "+userInput.getText().toString());

                                    FragmentTransaction tx = getActivity().getSupportFragmentManager().beginTransaction();
                                    tx.replace(R.id.content_frame, new RecentActivity());
                                    tx.commit();


                                } catch (JSONException e) {
                                    e.printStackTrace();
                                }
                            }
                        }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        VolleyLog.e("Error: ", error.getMessage());
                    }
                });
                requestQueue.add(req);
                InputMethodManager inputMethodManager = (InputMethodManager)  getActivity().getSystemService(Activity.INPUT_METHOD_SERVICE);
                inputMethodManager.hideSoftInputFromWindow(getActivity().getCurrentFocus().getWindowToken(), 0);
//                System.out.println("hier moet login komen "+ super.findViewById(R.id.nav_login));


            }
        });
    }

//    public void doLogin(View view){
//        userInput=(EditText) getView().findViewById(R.id.userInput);
//        passInput=(EditText) getView().findViewById(R.id.passInput);
//        statusText=(TextView) getView().findViewById(R.id.statusText);
//        new JSONTask(userInput.getText().toString(),passInput.getText().toString());
//    }
}
